export interface IConfig {
  PORT: number | null;
  NODE_ENV: 'development' | 'staging' | 'production';
  SALT_ROUNDS: number;
  Internal_name: string;
  // Database
  DB_HOST: string | null;
  DB_USER: string | null;
  DB_PASSWORD: string | null;
  DB_NAME: string | null;
  DB_PORT: number | null;

  // AWS
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_REGION: string;
  AWS_BUCKET: string;
  AWS_HOST: string;

  // ZAPIER
  OTP_URL: string;
  OTP_TOKEN: string;

  OTP_MAILER_USER: string;
  OTP_MAILER_PASS: string;

  // MAILER
  MAILER_HOST?: string;
  MAILER_PORT?: string;
  SUPPORT_MAILER_USER?: string;
  SUPPORT_MAILER_PASS?: string;
  SALES_MAILER_USER?: string;
  SALES_MAILER_PASS?: string;
  COMPETITION_MAILER_USER?: string;
  COMPETITION_MAILER_PASSWORD?: string;
  NO_REPLY_MAILER_USER?: string;
  NO_REPLY_MAILER_PASS?: string;

  // ESIGNATURE
  ESIGN_API_URL?: string;
  ESIGN_API_TOKEN?: string;

  MAIN_API?: string;

  // Marisit
  MARISIT_AUTH_URL?: string;
  MARISIT_FRAUD_CHECK_URL?: string;
  MARISIT_USERNAME?: string;
  MARISIT_PASSWORD?: string;

  // JSON WEB TOKEN
  JWT_SECRET?: string;

  // PEACH Credentials
  PEACH_USER_ID?: string;
  PEACH_PASSWORD?: string;
  PEACH_ENTITY_ID?: string;
  PEACH_BASE_URL?: string;

  MAILER_MAILER?: string;
  MAILER_PASSWORD?: string;

  SMTP_PASS?: string;
  SMTP_USER?: string;
  
}
