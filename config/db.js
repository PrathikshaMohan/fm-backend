const mysql = require('mysql');
const connection = mysql.createConnection({
  host: 'localhost',
  port: '3308',
  user: 'root',
  password: "",
  database: 'farmers_market'
  
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database!');
 
});

module.exports = connection;
