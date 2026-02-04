import type { Knex } from 'knex';
import config from './src/config/config'
if (
  !config.DB_HOST ||
  !config.DB_USER ||
  !config.DB_PASSWORD ||
  !config.DB_NAME ||
  !config.DB_PORT
) {
  console.error('Error on knex: Missing Requirements');
  throw new Error('Error on knex config: Missing valid required paramteres');
}
const commonConfig = {
  client: 'mysql2',
  pool: { min: 2, max: 10 },
  migrations: {
    tableName: 'knex_migrations',
    directory: './src/db/migrations',
    extension: 'ts',
  },
  seeds: {
    directory: './src/db/seeds',
    extension: 'ts',
  },
};

const knexConfig: Record<string, Knex.Config> = {
  development: {
    ...commonConfig,
    connection: {
      host: config.DB_HOST,
      user: config.DB_USER,
      password: config.DB_PASSWORD,
      database: config.DB_NAME,
      port: Number(config.DB_PORT),
    },
    // debug: true
  },

  staging: {
    ...commonConfig,
    connection: {
      host: config.DB_HOST,
      user: config.DB_USER,
      password: config.DB_PASSWORD,
      database: config.DB_NAME,
      port: Number(config.DB_PORT),
    },
  },

  production: {
    ...commonConfig,
    connection: {
      host: config.DB_HOST,
      user: config.DB_USER,
      password: config.DB_PASSWORD,
      database: config.DB_NAME,
      port: Number(config.DB_PORT),
      ssl: { rejectUnauthorized: false }, // optional, for production
    },
  },
};

export default knexConfig;
