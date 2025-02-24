const connection = require('../../connectDB');

//Hàm kiểm tra thông tin đăng nhập của người dùng nhập vào có đúng k
function selectLogin(result, tk, mk) {
    connection.query(
        'SELECT * FROM `taikhoan_kh` WHERE BINARY TenTK = ? AND BINARY MatKhau = PASSWORD(?)', [tk, mk],
        function(err, results) {
            if(err) throw err;
            return result(results);
        }
    );
}

//Hàm xử lý khi người dùng đăng ký tài khoản
function postSignUp(result, tk, mk) {
    connection.query(
        'INSERT INTO `taikhoan_kh`(`TenTK`, `MatKhau`, `TrangThai`, `NgayDK`) VALUES (?, PASSWORD(?), 1, now())', [tk, mk],
        function(err, results) {
            if(err) throw err;
            return result(results);
        }
    );
}

//Hàm kiểm tra tk và mk người dùng nhập đúng hay k
function isPass(callback, mktk, mkinput){
    connection.query(
        'SELECT * FROM `taikhoan_kh` WHERE TenTK = ? AND MatKhau = PASSWORD(?) ' , [mktk.TenTK, mkinput],
        function(err, results) {
            if(err) throw err;
            return callback(results);
        }
    )
}

//Hàm xử lý khi người dùng đổi mk
function postChangePass(callback, mk, id){
    connection.query(
        'UPDATE `taikhoan_kh` SET `MatKhau`= PASSWORD(?) WHERE ID = ? ' , [mk, id.ID],
        function(err, results) {
            if(err) throw err;
            return callback(results);
        }
    )
}

module.exports = {selectLogin, postSignUp, postChangePass, isPass};