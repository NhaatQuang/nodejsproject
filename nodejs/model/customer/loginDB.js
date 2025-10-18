const connection = require('../../connectDB');

// Hàm kiểm tra đăng nhập
function selectLogin(result, tk, mk) {
    connection.query(
        'SELECT * FROM `taikhoan_kh` WHERE BINARY TenTK = ? AND BINARY MatKhau = SHA2(?, 256)', 
        [tk, mk],
        function(err, results) {
            if(err) {
                console.error('❌ Login error:', err.message);
                return result([]);
            }
            return result(results);
        }
    );
}

// Hàm đăng ký
function postSignUp(result, tk, mk) {
    connection.query(
        'INSERT INTO `taikhoan_kh`(`TenTK`, `MatKhau`, `TrangThai`, `NgayDK`) VALUES (?, SHA2(?, 256), 1, NOW())', 
        [tk, mk],
        function(err, results) {
            if(err) {
                console.error('❌ Signup error:', err.message);
                return result(null);
            }
            console.log('✅ User registered:', tk);
            return result(results);
        }
    );
}

// Hàm kiểm tra mật khẩu
function isPass(callback, mktk, mkinput){
    connection.query(
        'SELECT * FROM `taikhoan_kh` WHERE TenTK = ? AND MatKhau = SHA2(?, 256)', 
        [mktk.TenTK, mkinput],
        function(err, results) {
            if(err) {
                console.error('❌ Password check error:', err.message);
                return callback([]);
            }
            return callback(results);
        }
    );
}

// Hàm đổi mật khẩu
function postChangePass(callback, mk, id){
    connection.query(
        'UPDATE `taikhoan_kh` SET `MatKhau` = SHA2(?, 256) WHERE ID = ?', 
        [mk, id.ID],
        function(err, results) {
            if(err) {
                console.error('❌ Change password error:', err.message);
                return callback(null);
            }
            console.log('✅ Password changed for ID:', id.ID);
            return callback(results);
        }
    );
}

module.exports = {selectLogin, postSignUp, postChangePass, isPass};