const connection = require('../../connectDB');

//Hàm thống kê số lượng sản phẩm đã bán trong ngày hiện tại từ db
function ThongKeTrongNgay(callback) {
    connection.query(
        'SELECT IDSanPham, sanpham.TenSanPham, SUM(cthoadon.SoLuong) as SoLuong, sum(ThanhTien) as ThanhTien, sanpham.GiaBan FROM cthoadon ' +
        ' INNER JOIN hoadon ON cthoadon.ID_HoaDon = hoadon.ID ' +
        ' INNER JOIN sanpham ON sanpham.ID = cthoadon.IDSanPham' +
        ' WHERE day(NgayMua) = day(now()) AND month(NgayMua) = month(now()) AND year(NgayMua) = year(now()) '+
        ' GROUP BY IDSanPham ',
        function(err, results) {
            if(err) throw err;
            return callback(results);
        }
      );
}

//Hàm thống kê số lượng sản phẩm đã bán trong khoảng đã chọn từ db
function ThongKeSearch(callback, dateStart, dateEnd) {
    connection.query(
        'SELECT IDSanPham, sanpham.TenSanPham, SUM(cthoadon.SoLuong) as SoLuong, sum(ThanhTien) as ThanhTien, sanpham.GiaBan FROM cthoadon ' +
        ' INNER JOIN hoadon ON cthoadon.ID_HoaDon = hoadon.ID ' +
        ' INNER JOIN sanpham ON sanpham.ID = cthoadon.IDSanPham' +
        ' WHERE date(NgayMua) BETWEEN ? AND ? '+
        ' GROUP BY IDSanPham ',
        [dateStart, dateEnd],
        function(err, results) {
            if(err) throw err;
            return callback(results);
        }
      );
}

module.exports = {ThongKeTrongNgay, ThongKeSearch};