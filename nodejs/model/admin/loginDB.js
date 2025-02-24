const connection = require('../../connectDB');

//Hàm kiểm tra thông tin đăng nhập của người dùng với tài khoản admin
function selectLogin(result, tk, mk) {
    connection.query(
        'SELECT * FROM `taikhoan_admin` WHERE BINARY TenTK = ? AND BINARY MatKhau = PASSWORD(?)', [tk, mk],
        function(err, results) {
            if(err) throw err;
            return result(results);
        }
      );
}

module.exports = {selectLogin};