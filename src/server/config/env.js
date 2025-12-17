/**
 * Environment configuration
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/pacman-lab',
  PYTHON_PATH: process.env.PYTHON_PATH || 'python3',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*'
};

