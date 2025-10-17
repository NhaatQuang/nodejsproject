const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dangquangwatch',
  multipleStatements: true,
  charset: 'utf8mb4'
});

connection.connect(function(err) {    
  if (err) {
    console.error('❌ Lỗi kết nối database:', err.stack);
    console.error('Thông tin kết nối:', {
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      database: process.env.DB_NAME || 'dangquangwatch'
    });
    return;
  }
  console.log('✅ Đã kết nối database:', process.env.DB_NAME || 'dangquangwatch'); 
}); 

module.exports = connection;