const homeDB = require('../../model/admin/homeDB');

const layout = './admin/layoutAdmin';
let getHome = (req, res) => {
    homeDB.ThongKeTrongNgay(function(data) {
        // if (req.session.isLogin){
            res.render('admin/homeAdmin.ejs', {layout: layout, dataHome: data});
            res.end();
        // }
        // else{
        //     res.redirect('/admin/login');
        //     res.end();
        // }
    })
}

module.exports = {
    getHome
}