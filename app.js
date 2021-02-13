const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const sassMiddleware = require('node-sass-middleware');
const database = require('./utils/database');
var bodyParser = require('body-parser');
const authHandler = require('./utils/auth-handler')

const indexRouter = require('./routes/index');
const addRouter = require('./routes/add');
const addHighlightsRouter = require('./routes/add-highlights');
const detailRouter = require('./routes/detail');
const loginRouter = require('./routes/login');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');
database.initialize();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(sassMiddleware({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: false,
    sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true }));

// Basic temporary authentication
app.use(function (req, res, next) {
    const authToken = req.cookies['authToken'];
    req.user = authHandler.authTokens[authToken];
    next();
});

app.use('/', indexRouter);
app.use('/add', addRouter);
app.use('/add-highlights', addHighlightsRouter);
app.use('/detail', detailRouter);
app.use('/login', loginRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
