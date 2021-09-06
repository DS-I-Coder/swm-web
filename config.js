const mysql = require('mysql');

// 로컬 DB 사용시 해당 부분을 mysql 설정에 맞춰서 변경
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
