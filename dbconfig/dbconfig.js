const sql = require('mssql');
const config =  require('../config');

// Database configuration
const dbConfig = {
  user: config.USER,
  password: config.PASSWORD,
  server: config.SERVER,
  database: config.DATABASE,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};



module.exports = dbConfig ;