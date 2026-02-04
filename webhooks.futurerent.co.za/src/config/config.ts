import { type IConfig } from '../types/config.types';
import dotenv from 'dotenv';
dotenv.config();

const config: IConfig = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : null,
  NODE_ENV:
    (process.env.NODE_ENV as 'development' | 'staging' | 'production') ||
    'development',
  Internal_name: process.env.Internal_name || '',
  SALT_ROUNDS: Number(process.env.SALT_ROUNDS),
  DB_HOST: process.env.DB_HOST || null,
  DB_NAME: process.env.DB_NAME || null,
  DB_USER: process.env.DB_USER || null,
  DB_PASSWORD: process.env.DB_PASSWORD || null,
  DB_PORT: Number(process.env.DB_PORT) || null,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
  AWS_REGION: process.env.AWS_REGION || '',
  AWS_BUCKET: process.env.AWS_BUCKET || '',
  AWS_HOST: process.env.AWS_HOST || '',
  OTP_TOKEN: process.env.OTP_TOKEN || '',
  OTP_URL: process.env.OTP_URL || '',
  MAILER_HOST: process.env.MAILER_HOST || '',
  MAILER_PORT: process.env.MAILER_PORT || '',
  SUPPORT_MAILER_USER: process.env.SUPPORT_MAILER_USER || '',
  SUPPORT_MAILER_PASS: process.env.SUPPORT_MAILER_PASS || '',
  SALES_MAILER_USER: process.env.SALES_MAILER_USER || '',
  SALES_MAILER_PASS: process.env.SALES_MAILER_PASS || '',
  COMPETITION_MAILER_USER: process.env.COMPETITION_MAILER_USER || '',
  COMPETITION_MAILER_PASSWORD: process.env.COMPETITION_MAILER_PASSWORD || '',
  NO_REPLY_MAILER_USER: process.env.NO_REPLY_MAILER_USER || '',
  NO_REPLY_MAILER_PASS: process.env.NO_REPLY_MAILER_PASS || '',
  // ADD OTP CONFIG HERE
  OTP_MAILER_USER:
    process.env.OTP_MAILER_USER || process.env.NO_REPLY_MAILER_USER || '',
  OTP_MAILER_PASS:
    process.env.OTP_MAILER_PASS || process.env.NO_REPLY_MAILER_PASS || '',
  JWT_SECRET: process.env.JWT_SECRET || '',
  MAIN_API: process.env.MAIN_API || '',
  MARISIT_AUTH_URL: process.env.MARISIT_AUTH_URL || '',
  MARISIT_FRAUD_CHECK_URL: process.env.MARISIT_FRAUD_CHECK_URL || '',
  MARISIT_USERNAME: process.env.MARISIT_USERNAME || '',
  MARISIT_PASSWORD: process.env.MARISIT_PASSWORD || '',
  PEACH_USER_ID: process.env.PEACH_USER_ID || '',
  PEACH_PASSWORD: process.env.PEACH_PASSWORD || '',
  PEACH_ENTITY_ID: process.env.PEACH_ENTITY_ID || '',
  PEACH_BASE_URL: process.env.PEACH_BASE_URL || '',
  MAILER_MAILER: process.env.MAILER_MAILER || '',
  MAILER_PASSWORD: process.env.MAILER_PASSWORD || '',
  ESIGN_API_URL: process.env.ESIGN_API_URL || '',
  ESIGN_API_TOKEN: process.env.ESIGN_API_TOKEN || '',
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
};

export default config;
