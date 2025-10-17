require('dotenv').config();
const express = require("express");
const expressLayouts = require('express-ejs-layouts');
const initAdminRouter = require('./route/admin/initAdminRouter');
const initCustomerRouter = require('./route/customer/initCustomerRouter');
const fileUpload = require('express-fileupload');
var cookieParser = require('cookie-parser');

let session = require('express-session');


const app = express();
const port = 3000;

app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
  }))

app.use(fileUpload({
    tempFilePath: true
}));
// app.use(express.urlencoded({ extended: true}));
// app.use(express.json());

app.use(express.static('./public'));

app.set('view engine', 'ejs');
app.use(expressLayouts);

initAdminRouter(app);
initCustomerRouter(app);

app.get('*', function(req, res){
    res.render('404.ejs', {layout: './404'});
});
// app.set('layout', './customer/nolayout');

// Health check endpoint (cho Render)
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'Server is running',
        database: process.env.DB_NAME 
    });
});

// PORT - QUAN TRỌNG cho Render
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log('═══════════════════════════════════════');
    console.log(`🚀 Server đang chạy trên port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📦 Database: ${process.env.DB_NAME || 'dangquangwatch'}`);
    console.log(`🔗 URL: http://localhost:${PORT}`);
    console.log('═══════════════════════════════════════');
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ 
        error: 'Có lỗi xảy ra!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
    });
});


app.listen(port, () => {
    console.log(`Run http://localhost:${port}/customer/home`)
})