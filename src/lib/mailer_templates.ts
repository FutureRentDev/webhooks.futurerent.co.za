/* eslint-disable @typescript-eslint/no-explicit-any */
export const awaitingDepositMailer = (data: any) => {
  const vehicleFull = [data.year, data.make, data.model]
    .filter(Boolean)
    .join(' ')
    .trim();

  const paymentUrl = `https://payments.futurerent.co.za/add-card?account_id=${data.id}&charge=${data.deposit}`;
  return `
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <link href="https://fonts.googleapis.com/css?family=Product+Sans:100,300,400,500,700,900&display=swap" rel="stylesheet">
    <style>
      img { border: none; -ms-interpolation-mode: bicubic; max-width: 100%; }
      body {
        background-color: #f5f7fa;
        font-family: "Product Sans", sans-serif;
        -webkit-font-smoothing: antialiased;
        font-size: 16px;
        line-height: 1.4;
        margin: 0;
        padding: 0;
        -ms-text-size-adjust: 100%;
        -webkit-text-size-adjust: 100%;
      }
      table { border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; }
      table td { font-family: "Product Sans", sans-serif; font-size: 16px; vertical-align: top; color: #686868; }
      .body { background-color: #f5f7fa; width: 100%; }
      .container { display: block; margin: 0 auto !important; max-width: 580px; padding: 10px; width: 580px; }
      .content { box-sizing: border-box; display: block; margin: 0 auto; max-width: 580px; padding: 10px; }
      .main { background: #ffffff; border-radius: 8px; width: 100%; }
      .wrapper { box-sizing: border-box; padding: 40px; }
      .footer { clear: both; margin-top: 10px; text-align: center; width: 100%; }
      .footer td, .footer p, .footer span, .footer a { color: #999999; font-size: 12px; text-align: center; }
      h1, h2, h3, h4 { color: #0B1734; font-family: "Product Sans", sans-serif; font-weight: 400; line-height: 1.4; margin: 0 0 20px 0; }
      span.high { color: #0B1734; font-weight: 500; }
      p { font-family: "Product Sans", sans-serif; font-size: 16px; font-weight: normal; margin: 0 0 25px 0; color: #686868; line-height: 1.6; }
      a { color: #0B1734; text-decoration: none; }
      .btn { box-sizing: border-box; width: 100%; }
      .btn table { width: auto; }
      .btn table td { background-color: #ffffff; border-radius: 5px; text-align: center; }
      .btn a {
        background-color: #0B1734;
        border: solid 1px #0B1734;
        border-radius: 5px;
        box-sizing: border-box;
        cursor: pointer;
        display: inline-block;
        font-size: 16px;
        font-weight: bold;
        margin: 0;
        padding: 12px 25px;
        text-decoration: none;
        text-transform: capitalize;
      }
      .btn-primary table td { background-color: #0B1734; }
      .btn-primary a { background-color: #0B1734; border-color: #0B1734; color: #ffffff; }

      @media only screen and (max-width: 620px) {
        table.body h1 { font-size: 28px !important; margin-bottom: 10px !important; }
        table.body p, table.body td, table.body span, table.body a { font-size: 16px !important; }
        table.body .wrapper { padding: 10px !important; }
        table.body .content { padding: 0 !important; }
        table.body .container { padding: 0 !important; width: 100% !important; }
        table.body .main { border-radius: 0 !important; }
        table.body .btn table { width: 100% !important; }
        table.body .btn a { width: 100% !important; }
      }
    </style>
  </head>

  <body>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body">
      <tr>
        <td> </td>
        <td class="container">
          <div class="content">

            <table role="presentation" class="main">
              <tr>
                <td class="wrapper">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td>

<picture>
  <source srcset="https://cdn.futurerent.co.za/media/futurerent-logo-white.png" media="(prefers-color-scheme: dark)" height="22px" style="margin-bottom: 40px;">
  <img src="https://cdn.futurerent.co.za/media/futurerent-logo-blue.png" height="22px" style="margin-bottom: 40px;">
</picture>

<h2 style="font-weight: 500; font-size: 36px; margin-bottom: 15px;">Initiation Fee</h2>

<p>
  Thank you <span class="high">${data.first_name + ' ' + data.last_name }</span>. We’ve received your accepted agreement and can’t wait to get you on the road.
</p>

<p>
  To reserve your <span class="high">${vehicleFull}</span>, please complete the initiation fee step below.
</p>

<h3 style="font-weight: 600; font-size: 18px; margin-bottom: 10px;">Initiation Fee</h3>
<p style="margin-bottom: 15px;"><span class="high">R${data.deposit}</span></p>

<table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary" style="margin:20px 0 15px 0;">
  <tbody>
    <tr>
      <td align="left">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0">
          <tbody>
            <tr>
              <td><a href="${paymentUrl}" target="_blank">Make Payment</a></td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  </tbody>
</table>

<p>
  Once we received the initiation fee, our team will begin preparing your vehicle for delivery.
</p>

<p style="margin-bottom: 0;">
  If you have any questions, reach us anytime at
  <a href="mailto:admin@futurerent.co.za">admin@futurerent.co.za</a>.
</p>

<p style="margin: 25px 0 0 0; color: #0B1734;">From <b>FutureRent</b></p>

                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <div class="footer">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td class="content-block">
                    <span class="apple-link"><strong>FutureRent</strong>. All Rights Reserved.</span>
                  </td>
                </tr>
              </table>
            </div>

          </div>
        </td>
        <td> </td>
      </tr>
    </table>
  </body>
</html>
`;
};
