var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var app = express();
var favicon = require('serve-favicon');

const session = require('express-session');
const passport = require('./config/passport-config');
const cors = require('cors');

const MongoStore = require('connect-mongo');

const dotenv = require('dotenv');
dotenv.config();

// routes cho web
var indexwebRouter = require('./routes/web/index');
var userswebRouter = require('./routes/web/users');
var loginwebRouter = require('./routes/web/login'); 
var postwebRouter = require('./routes/web/post');
var logoutwebRouter = require('./routes/web/logout');
var registerwebRouter = require('./routes/web/register'); 
var profilewebRouter = require('./routes/web/userprofile'); 
var friendwebRouter = require('./routes/web/userfriend'); 
var communitywebRouter = require('./routes/web/community'); 
var chatwebRouter = require('./routes/web/chat'); 
var messagewebRouter = require('./routes/web/message'); 

// routes cho mobile
var indexapiRouter = require('./routes/api/index');
var usersapiRouter = require('./routes/api/users');
var loginapiRouter = require('./routes/api/login');
var postapiRouter = require('./routes/api/post'); 
var logoutapiRouter = require('./routes/api/logout');
var registerapiRouter = require('./routes/api/register');
var profileapiRouter = require('./routes/api/userprofile');
var friendapiRouter = require('./routes/api/userfriend');
var communityapiRouter = require('./routes/api/community');
var chatapiRouter = require('./routes/api/chat');
var messageapiRouter = require('./routes/api/message'); 

// app.set
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.use
app.use(cors({
  origin: 'http://yourfrontend.com', // Hoặc mảng các domain frontend
  credentials: true
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// Đường dẫn đến favicon
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  store: MongoStore.create({
    mongoUrl: 'mongodb://localhost:27017/social_network', // URL của MongoDB
    collectionName: 'sessions' // Tên collection lưu session
  }),
  secret: '90435878234789230', // Thay thế bằng một khóa bí mật của bạn
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Chỉ sử dụng cookie bảo mật trong môi trường production (HTTPS)
    httpOnly: true, // Bảo vệ cookie khỏi các tấn công XSS
    maxAge: 60 * 1000 // Thời gian sống của session cookie (ví dụ: 60 giây)
  }  
}));

app.use(passport.initialize());
app.use(passport.session());

// app.use web
app.use('/', indexwebRouter); // Đặt indexRouter ở đây để xử lý khi người dùng đã đăng nhập
app.use('/manager', userswebRouter);
app.use('/friend', friendwebRouter);
app.use('/login', loginwebRouter);
app.use('/post', postwebRouter);
app.use('/logout', logoutwebRouter);
app.use('/register', registerwebRouter);
app.use('/profile', profilewebRouter);
app.use('/chat', chatwebRouter);
app.use('/community', communitywebRouter);
app.use('/message', messagewebRouter);

// app.use api
app.use('/api', indexapiRouter); // Đặt indexRouter ở đây để xử lý khi người dùng đã đăng nhập
app.use('/api/user', usersapiRouter);
app.use('/api/friend', friendapiRouter);
app.use('/api/login', loginapiRouter);
app.use('/api/post', postapiRouter);
app.use('/api/logout', logoutapiRouter);
app.use('/api/register', registerapiRouter);
app.use('/api/profile', profileapiRouter);
app.use('/api/chat', chatapiRouter);
app.use('/api/community', communityapiRouter);
app.use('/api/message', messageapiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

mongoose.connect('mongodb://localhost:27017/social_network').then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('MongoDB connection error:', error);
});

module.exports = app;
