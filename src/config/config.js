const dotenv = require('dotenv');

// load environment file
dotenv.config();
const HOST = process.env.HOST || '127.0.0.1';
const PORT = process.env.PORT || 8111;
const LOG_PATH = process.env.LOG_PATH || './logs';
const DWN_END_POINTS = [process.env.DWN_END_POINTS] || [
  'http://127.0.0.1:3000',
];
const DWN_NAME = process.env.DWN_NAME || 'Current DWN name';
const EXCLUDE_SCHEMA = [
    'https://identity.foundation/schemas/web5/managed-did',
    'https://identity.foundation/schemas/web5/managed-identity'
];

const DWN_SYNC_SECONDS = process.env.DWN_SYNC_SECONDS || 5;

module.exports = {
  HOST,
  PORT,
  LOG_PATH,
  DWN_END_POINTS,
  DWN_NAME,
  EXCLUDE_SCHEMA,
  DWN_SYNC_SECONDS
};
