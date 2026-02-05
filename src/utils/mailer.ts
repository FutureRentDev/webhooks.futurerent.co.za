/* eslint-disable @typescript-eslint/no-explicit-any */
import { ZapierWebhook } from "../lib/zapier";
import initializeTransporter from "../lib/nodemailer";
import type { Transporter, SentMessageInfo } from "nodemailer";

async function mailerTrigger(
  trigger_name?: string | null,
  options?: any
): Promise<ZapierWebhook | Transporter<SentMessageInfo>> {
//   console.log(trigger_name, "trigger_name");

  switch (trigger_name) {
    case "zaiper": {
      return new ZapierWebhook(options.webHookUrl, options.webHookToken);
    }
    case "nodemailer": {
      return initializeTransporter(options?.type);
    }
    default: {
      throw new Error("Invalid mailer template type");
    }
  }
}

async function sendMailer(trigger_name?: string, options?: any, body?: any) {
  try {
    const trigger = await mailerTrigger(
      trigger_name ? trigger_name : null,
      options
    );

    
    if (trigger_name === "nodemailer" && "sendMail" in trigger) {
      const mailOptions = {
        from: options.from || '"No Reply" <no-reply@futurerent.co.za>',
        to: options.to,
        subject: options.subject || "Default Subject",
        text: body?.text || "",
        html: body?.html || "",
      };

      const info = await trigger.sendMail(mailOptions);
    //   console.log("Message sent: %s", info.messageId);
      
      return info;
    }
    if (trigger_name === "zaiper" && "trigger" in trigger) {
      return trigger.trigger(body);
    }

    throw new Error("Unsupported mailer type");
  } catch (error: any) {
    console.error("Error on sendMailer: ", error.message);
    throw new Error(error);
  }
}


//  use case
// sendMailer('nodemailer', {type: "no-reply", from: 'no-reply', to: 'shanekolkoto@gmail.com', cc: 'shanekolkoto@gmail.com', subject: "Test mailer"}, {html: ForgotPasswordTemplate({name: "Shane", resetLink: "test", expiryTime: 30})})
// sendMailer('zaiper', {webHookUrl: config.OTP_URL, webHookToken: config.OTP_TOKEN}, {email: "shanekolkoto@gmail.com", otp: 12345666})

export default sendMailer;
