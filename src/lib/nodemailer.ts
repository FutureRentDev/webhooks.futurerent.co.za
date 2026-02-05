import nodemailer, { Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import config from '../config/config';

let transporter: Transporter<SMTPTransport.SentMessageInfo>;

async function initializeTransporter(type = 'default') {
  if (transporter) return transporter;

  if (config.NODE_ENV === 'development') {
    const testAccount = await nodemailer.createTestAccount();

    console.log(testAccount, 'testAccount')
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    } as SMTPTransport.Options);

    return transporter;
  }

  let options: SMTPTransport.Options;

  switch (type) {
    case 'support':
      options = {
        host: config.MAILER_HOST,
        port: Number(config.MAILER_PORT) || 587,
        secure: false,
        auth: {
          user: config.SUPPORT_MAILER_USER,
          pass: config.SUPPORT_MAILER_PASS,
        },
      };
      break;

    case 'sales':
      options = {
        host: config.MAILER_HOST,
        port: Number(config.MAILER_PORT) || 587,
        secure: false,
        auth: {
          user: config.SALES_MAILER_USER,
          pass: config.SALES_MAILER_PASS,
        },
      };
      break;

    case 'competition':
      options = {
        host: config.MAILER_HOST,
        port: Number(config.MAILER_PORT) || 587,
        secure: false,
        auth: {
          user: config.COMPETITION_MAILER_USER,
          pass: config.COMPETITION_MAILER_PASSWORD,
        },
      };
      break;

    case 'no-reply':
      options = {
        host: config.MAILER_HOST,
        port: Number(config.MAILER_PORT) || 587,
        secure: false,
        auth: {
          user: config.NO_REPLY_MAILER_USER,
          pass: config.NO_REPLY_MAILER_PASS,
        },
      };
      break;

    default:
      options = {
        host: config.MAILER_HOST,
        port: Number(config.MAILER_PORT) || 587,
        secure: false,
        auth: {
          user: config.NO_REPLY_MAILER_USER,
          pass: config.NO_REPLY_MAILER_PASS,
        },
      };
      break;
  }

  transporter = nodemailer.createTransport(options);

  return transporter;
}

export default initializeTransporter;
