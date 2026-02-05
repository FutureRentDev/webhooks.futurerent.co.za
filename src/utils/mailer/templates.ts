/* eslint-disable @typescript-eslint/no-explicit-any */
export const ForgotPasswordTemplate = (data: any) => {
  const { name, resetLink, expiryTime } = data;

  return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <title>FutureRent: Reset Your Password</title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#F4F4F4; font-family: Arial, sans-serif ">

    <div style="display:none; font-size:0px; color:#333333; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden;">
        FutureRent Password Reset Notification
    </div>

    <div style="max-width:600px; margin:0 auto; background-color:#F4F4F4; padding:20px 0;">
        <div style="background-color:#FFFFFF; width:100%; max-width:480px; margin:0 auto; padding:40px;">
            
            <h1 style="margin:0 0 25px 0; line-height:41px; font-weight:400; font-size:30px; letter-spacing:-1.2px; color:#0B1734; font-family: Arial, sans-serif;">
             Reset Your Password
            </h1>

            <p style="margin:0 0 20px 0; font-size:16px; line-height:24px; color:#333333; font-family: Arial, sans-serif;">
                Hi <span style="font-weight:700;">${name}</span>,
            </p>

            <p style="margin:0 0 20px 0; font-size:16px; line-height:24px; color:#333333; font-family: Arial, sans-serif;">
                We received a request to reset your password for your <strong>FutureRent account</strong>.
            </p>

            <p style="margin:20px 0;">
                <a href="${resetLink}" 
                   style="display:inline-block; padding:12px 24px; background-color:#0B1734; color:#ffffff; text-decoration:none; border-radius:6px; font-size:16px; font-weight:600;">
                   Reset Password
                </a>
            </p>

            <p style="margin:20px 0; font-size:14px; color:#666;">
                This link will expire in <strong>${expiryTime || '30 minutes'}</strong>.  
                If you didn’t request a password reset, you can safely ignore this email.
            </p>

            <p style="margin:20px 0; font-size:14px; color:#666;">
                If you have any issues, feel free to contact us at <a href="mailto:queries@futurerent.co.za">queries@futurerent.co.za</a>.
            </p>

            <p style="margin-top:30px; font-size:12px; line-height:18px; color:#777777; font-family: Arial, sans-serif; ">
                For your security, this link can only be used once. If it expires, you’ll need to request another password reset.
            </p>

            <div style="margin-bottom:30px; margin-top: 30px;">
                <img style="display:block; width:185px; height:auto;" src="https://cdn.futurerent.co.za/media/futurerent-logo-blue.png" alt="FutureRent">
            </div>

            <div style="margin-top:10px;">
               <a href="https://www.facebook.com/futurerentza" style="display:inline-block; margin-right:8px;">
                   <img src="https://application.futurerent.co.za/assets/media/facebook.png" alt="Facebook" style="width:25px; height:auto;">
               </a>
               <a href="https://www.instagram.com/futurerentza" style="display:inline-block; margin-right:8px;">
                   <img src="https://application.futurerent.co.za/assets/media/instagram.png" alt="Instagram" style="width:25px; height:auto;">
               </a>
               <a href="https://www.linkedin.com/company/futurerentza" style="display:inline-block; margin-right:8px;">
                   <img src="https://application.futurerent.co.za/assets/media/linkedin.png" alt="LinkedIn" style="width:25px; height:auto;">
               </a>
               <a href="https://api.whatsapp.com/send?phone=27872650918&text=Hello" style="display:inline-block; margin-right:8px;">
                   <img src="https://application.futurerent.co.za/assets/media/whatsapp.png" alt="WhatsApp" style="width:25px; height:auto;">
               </a>
           </div>
       </div>
   </div>
</body>
</html>
  `;
};
