/* globals require, global, __dirname, module */

var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');
var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
//var ObjectId = require('mongodb').ObjectID;

// TODO : avoid usage of constants variable.
var constants = JSON.parse(fs.readFileSync('constants.json', 'utf8'));
global.mongoUrl = constants.mongoUrl;
global.web3Provider = constants.web3Provider;
global.contracts = constants.contracts;
global.accounts = constants.accounts;

var index = require('./routes/index');
var api = require('./routes/api_ethereum');
var contracts = require('./routes/contracts');
var insurance = require('./routes/insurance');
var log = require('./routes/log_reader');
var tesseract = require('./routes/tesseract');

var app = express();
app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'doc')));

// app.get('/*', function (req, res, next) {
//   MongoClient.connect(global.mongoUrl, function (error, db) {
//     db.collection('stat').insertOne({
//       "path": req.path,
//       "query": req.query,
//       "params": req.params,
//       "body": req.body,
//       "method": req.method,
//       "date": new Date(),
//       "SourceIp": req.ip
//     }, function (err, result) {
//       assert.equal(err, null);
//       db.close();
//       next();
//     });
//   });
// });

app.use('/', index);
app.use('/api', api);
app.use('/contracts', contracts);
app.use('/insurance', insurance);
app.use('/log', log);
app.use('/tesseract', tesseract);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // Insert into DB
  // MongoClient.connect(global.mongoUrl, function (error, db) {
  //   db.collection('log').insertOne({
  //     "message": err.message,
  //     "StackTrace": err,
  //     "date": new Date(),
  //     "SourceIp": req.connection.remoteAddress
  //   }, function (err, result) {
  //     assert.equal(err, null);
  //     db.close();
  //   });
  // });

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;