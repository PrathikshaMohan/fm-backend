const mysql = require('mysql2');
const url = require('url');
require('dotenv').config();

const dbUrl = process.env.MYSQL_URL;

const parsedUrl = new url.URL(dbUrl);

const connection = mysql.createConnection({
  host: parsedUrl.hostname,
  port: parsedUrl.port,
  user: parsedUrl.username,
  password: parsedUrl.password,
  database: parsedUrl.pathname.replace('/', ''),
});

connection.connect((err) => {
  if (err) {
    console.error("❌ Database connection error:", err);
  } else {
    console.log("✅ Connected to Railway MySQL database!");
  }
});

module.exports = connection;
