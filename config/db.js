const mysql = require('mysql');
require('dotenv').config({ path: './config/config.env' }); // adjust path if needed

const connection = mysql.createConnection({
  host: process.env.DB_HOST,         // Railway MySQL host
  port: process.env.DB_PORT || '3306',  // Railway MySQL port or default 3306
  user: process.env.DB_USER,         // Railway MySQL username
  password: process.env.DB_PASS,     // Railway MySQL password
  database: process.env.DB_NAME      // Railway MySQL database name
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    throw err;
  }
  console.log('Connected to MySQL database!');
});

module.exports = connection;
