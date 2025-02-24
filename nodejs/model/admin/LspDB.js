const connection = require('../../connectDB');

//Hàm trả về date định dang kiểu YYYY/MM/DD HH:MM:SS
function format_date(date) {
    return date.getFullYear() + "/" +
    ("0" + (date.getMonth()+1)).slice(-2) + "/" +
    ("0" + date.getDate()).slice(-2) + " " +
    ("0" + date.getHours()).slice(-2) + ":" +
    ("0" + date.getMinutes()).slice(-2) + ":" +
    ("0" + date.getSeconds()).slice(-2);
}

//Hàm lấy thông tin loại sản phẩm từ db
let getLspDB = (callback) => {
    connection.query(
        'SELECT ID, Ten, NgayThem, update_at, showw FROM loaisanpham ORDER BY update_at DESC; ', 
        function(err, results) {
            if(err) throw err;
            results.forEach(data => {
                data.NgayThem = format_date(data.NgayThem);
                data.update_at = format_date(data.update_at);
            });
            return callback(results);
        }
    );
}

//Hàm cập nhật trạng thái "hiện"
function showDB(callback, id){
    connection.query(
        'UPDATE loaisanpham SET showw = 1 WHERE ID = ? ; ' +
        'UPDATE sanpham SET show_lsp = 1 WHERE ID_LoaiSanPham = ? ',
        [id, id],
        function(err, results) {
            if(err) throw err;
            return callback(results);
        }
    )
}

//Hàm cập nhật trạng thái "ẩn"
function hiddenDB(callback, id){
    connection.query(
        'UPDATE loaisanpham SET showw = 0 WHERE ID = ? ;' +
        'UPDATE sanpham SET show_lsp = 0 WHERE ID_LoaiSanPham = ? ',
        [id, id],
        function(err, results) {
            if(err) throw err;
            return callback(results);
        }
    )
}

//Hàm tạo mới loại sản phẩm
let createLspDB = (callback, lspName) => {
    connection.query(
        'INSERT INTO loaisanpham(Ten, NgayThem, update_at) VALUES (?, now(), now())',[lspName],
        function(err, results) {
            if(err) throw err;
            return callback(results);
        }
    );
}

//Hàm sửa loại sản phẩm
let updateLspDB = (callback, lspName, lspID) => {
    connection.query(
        'UPDATE loaisanpham SET Ten = ?, update_at = now() WHERE ID = ?', [lspName, lspID],
        function(err, results) {
            if(err) throw err;
            return callback(results);
        }
    );
}

//Hàm xoá loại sản phẩm
let deleteLspDB = (callback, idlsp) => {
    connection.query(
        'DELETE FROM sanpham WHERE ID_LoaiSanPham = ?; DELETE FROM loaisanpham WHERE ID = ?', [idlsp, idlsp],
        function(err, results) {
            if(err) throw err;
            return callback(results);
        }
    );
}

module.exports = {
    getLspDB, createLspDB, updateLspDB, deleteLspDB, showDB, hiddenDB
}