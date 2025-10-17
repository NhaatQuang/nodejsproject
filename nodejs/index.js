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

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ 
        error: 'Có lỗi xảy ra!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
    });
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
    const baseURL = process.env.NODE_ENV === 'production' 
        ? `https://dangquangwatch.onrender.com` 
        : `http://localhost:${PORT}`;
    
    console.log('');
    console.log('╔════════════════════════════════════════════════╗');
    console.log('║        🚀 ĐỒNG HỒ ĐĂNG QUANG SERVER           ║');
    console.log('╚════════════════════════════════════════════════╝');
    console.log('');
    console.log('  📊 Server Information:');
    console.log('  ├─ Port:', PORT);
    console.log('  ├─ Environment:', process.env.NODE_ENV || 'development');
    console.log('  └─ Host:', HOST);
    console.log('');
    console.log('  🌐 URLs:');
    console.log('  ├─ Base:', baseURL);
    console.log('  ├─ Home:', baseURL + '/customer/home');
    console.log('  ├─ Admin:', baseURL + '/admin');
    console.log('  └─ Health:', baseURL + '/health');
    console.log('');
    console.log('  💾 Database:', process.env.DB_NAME || 'dangquangwatch');
    console.log('');
    console.log('════════════════════════════════════════════════');
    console.log('');
});