const mysql = require('mysql2');
const url = require('url');
require('dotenv').config();

const dbUrl = process.env.MYSQL_URL;
const parsedUrl = new url.URL(dbUrl);

const pool = mysql.createPool({
  host: parsedUrl.hostname,
  port: parsedUrl.port,
  user: parsedUrl.username,
  password: parsedUrl.password,
  database: parsedUrl.pathname.replace('/', ''),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
