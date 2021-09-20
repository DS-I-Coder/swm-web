const mysql = require('mysql');

const connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '1234',
  database : 'swm',
});

connection.connect(function (err) {
  if (!err) {
    console.log("Database is connected");
  } else {
    console.log(err);
    console.log("Error while connecting with database");
  }
});

module.exports = connection;
