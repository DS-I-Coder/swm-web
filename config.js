const mysql = require('mysql');

const connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'icoder1101',
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
