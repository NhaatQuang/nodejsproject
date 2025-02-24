const homeDB = require('../../model/customer/homeDB');
const headerDB = require('../../model/customer/headerDB');

const layout = './customer/layoutCustomer';

let getHome = (req, res) => {
    let header
headerDB.getHeader((data) => {
    header = data
})
    homeDB.getHome((data) => {
        res.render('customer/home.ejs', {layout: layout, sessionID: req.cookies.dataLogin, dataHeaderSp: header[0], dataHeaderXx: header[1], dataHomeLsp: data[0], dataHomeSp: data[1]});
        res.end();
    })
}

module.exports = {
    getHome
}