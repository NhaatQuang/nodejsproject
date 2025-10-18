const connection = require('../../connectDB');

// Hàm kiểm tra đăng nhập admin
function selectLogin(result, tk, mk) {
    connection.query(
        'SELECT * FROM `taikhoan_admin` WHERE BINARY TenTK = ? AND BINARY MatKhau = SHA2(?, 256)', 
        [tk, mk],
        function(err, results) {
            if(err) {
                console.error('❌ Admin login error:', err.message);
                return result([]);
            }
            return result(results);
        }
    );
}

// Hàm đăng ký admin (nếu cần)
function postSignUp(result, tk, mk) {
    connection.query(
        'INSERT INTO `taikhoan_admin`(`TenTK`, `MatKhau`, `TrangThai`, `NgayDK`) VALUES (?, SHA2(?, 256), 1, NOW())', 
        [tk, mk],
        function(err, results) {
            if(err) {
                console.error('❌ Admin signup error:', err.message);
                return result(null);
            }
            console.log('✅ Admin registered:', tk);
            return result(results);
        }
    );
}

// Hàm kiểm tra mật khẩu admin
function isPass(callback, mktk, mkinput){
    connection.query(
        'SELECT * FROM `taikhoan_admin` WHERE TenTK = ? AND MatKhau = SHA2(?, 256)', 
        [mktk.TenTK, mkinput],
        function(err, results) {
            if(err) {
                console.error('❌ Admin password check error:', err.message);
                return callback([]);
            }
            return callback(results);
        }
    );
}

// Hàm đổi mật khẩu admin
function postChangePass(callback, mk, id){
    connection.query(
        'UPDATE `taikhoan_admin` SET `MatKhau` = SHA2(?, 256) WHERE ID = ?', 
        [mk, id.ID],
        function(err, results) {
            if(err) {
                console.error('❌ Admin change password error:', err.message);
                return callback(null);
            }
            console.log('✅ Admin password changed for ID:', id.ID);
            return callback(results);
        }
    );
}

module.exports = {selectLogin, postSignUp, postChangePass, isPass};