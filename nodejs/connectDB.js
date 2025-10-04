const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '', // Thêm password nếu có
  database: 'dangquangwatch',
  multipleStatements: true
});

connection.connect(function(err) {    
  if (err) throw err;    
  console.log('Da ket noi database'); 
}); 

module.exports = connection;