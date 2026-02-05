import { Router, Request, Response } from 'express';
import { insertS3Object, downloadFileAsBuffer } from '../../utils/s3utils';
import { createItem, updateItem } from '../../db/queries';
import sendMailer from '../../utils/mailer';
import { awaitingDepositMailer } from '../../lib/mailer_templates';
const webhooksRouter = Router();

webhooksRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { status, data } = req.body;

    const contract = data?.contract;
    if (!contract) return res.sendStatus(200);

    if (contract.title !== "Vehicle Rental Agreement") return res.sendStatus(200);
    if (status !== "contract-signed") return res.sendStatus(200);

    const contractId = contract.signers[0].company_name;
    const pdfUrl = contract.contract_pdf_url;

    if (!pdfUrl) {
      console.warn("No contract PDF URL found", contractId);
      return res.sendStatus(200);
    }

    const finalizedDate = new Date(contract.finalized_at);
    const yyyy = finalizedDate.getFullYear();
    const mm = String(finalizedDate.getMonth() + 1).padStart(2, '0');
    const dd = String(finalizedDate.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    const fileName = `vehicle-rental-agreement-${dateStr}.pdf`;

    const s3Key = `contracts/${contractId}/${fileName}`;

    // 1. Download signed PDF
    const pdfBuffer = await downloadFileAsBuffer(pdfUrl);

    // 2. Upload to your Space
    await insertS3Object({
      key: s3Key,
      fileContents: pdfBuffer,
    });

    // 3. Insert into DB
    const dbPayload = {
      file_name: "vehicle-rental-agreement.pdf",
      file_type: "Rental Agreement",
      file_key: s3Key,
      file_size: pdfBuffer.length,
      file_ext: "pdf",
      status: "signed",
      role_id: 1, // replace with your logic
      table_name: "applications",
      detail_id: Number(contractId),
      upload_user_id: 1,
    };

    await createItem("files_metadata", dbPayload);
    
    // Update application and get the updated application data
    const application = await updateItem('applications', contractId, {
      cust_steps: "Awaiting Deposit",
      status: "Contract Signed"
    });

    // Extract email from the application object
    // Assuming the application object has an 'email' property
    // Adjust the property name based on your actual database schema
    const customerEmail = application.email;
    console.log(customerEmail)
    
    // Or if the email is nested, you might need to access it differently:
    // const customerEmail = application.user?.email;
    // const customerEmail = application.customer_email;
    // const customerEmail = application.contact_email;

    if (!customerEmail) {
      console.warn("No email found in application", contractId);
      return res.sendStatus(200);
    }

    // Send email using the email from the application
    sendMailer('nodemailer', {
      type: "no-reply", 
      from: 'no-reply', 
      to: customerEmail, // Use the email from application
      subject: "Deposit Payment"
    }, {
      html: awaitingDepositMailer(application)
    });

    return res.sendStatus(200);
  } catch (error) {
    console.error("Error on e-signature webhook", error);
    return res.sendStatus(200);
  }
});

export default webhooksRouter;
