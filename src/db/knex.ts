import knex from 'knex';
import config from '../config/config';
import knexConfig from '../../knexfile';
const environment = config.NODE_ENV || 'development';

const db = knex(knexConfig[environment]);


// db.on('query', function (data) {
//   console.log('SQL:', data.sql);
//   console.log('Bindings:', data.bindings);
// });

export default db;
