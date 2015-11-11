var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

var mongodb = require('mongodb').MongoClient;
var ObjectID=require('mongodb').ObjectID;
var dbUrl ='mongodb://127.0.0.1:27017/';
dbUrl = 'mongodb://JassPlanMongoLab:J3dZwB8qR3XO.Q6x.DO_MSeK8fUxxgk51OEYgQb2VJE-@ds034878.mongolab.com:34878/JassPlanMongoLab';
var path = require('path');

function callDbAndRespond(req,res,query){
  var user = getUser(req);
  mongodb.connect(dbUrl + "udb_" + user,function(err,db){
    if (err) res.send({data:null, status:err });
    else query(req,res,db,function(err,doc){
      res.send({data:doc, status:err?err:'ok' });
      db.close();
    });
  });
}

function getUser(req){  //JUST A DRAFT FIX THIS
  var username, password;
  var auth = req.headers['authorization'];
  if (auth){
    var tmp = auth.split(' ');   // Split on a space, the original auth looks like  "Basic Y2hhcmxlczoxMjM0NQ==" and we need the 2nd part

    var buf = new Buffer(tmp[1], 'base64'); // create a buffer and tell it the data coming in is base64
    var plain_auth = buf.toString();        // read it back out as a string

    console.log("Decoded Authorization ", plain_auth);

    // At this point plain_auth = "username:password"

    var creds = plain_auth.split(':');      // split on a ':'
    username = creds[0];
    password = creds[1];
    //we still need to authorize

  } else {
    username = "test";
  }

  return username;
}

app.use('/public', express.static('../public'));

app.get('/test', function(req,res){
  res.sendfile('public/testing/spec/specrunner.html');
});

app.get('/', function(req,res){
  res.send("Jassplan TO-DO REST API 2015 Version 0");
});

app.get('/todo', function(req,res){
  callDbAndRespond(req,res, function(req,res,db, next){
    db.collection('todo').find({}).toArray(next);
  });
});

app.get('/todo/:id', function(req,res){
  callDbAndRespond(req,res, function(req,res,db, next){
    db.collection('todo').findOne({"_id":ObjectID(req.params.id)},next);
  });
});

app.post('/todo', function(req,res){
  callDbAndRespond(req,res, function(req,res,db, next){
    db.collection('todo').insert(req.body,next);
  });
});

app.delete('/todo', function(req,res){
  callDbAndRespond(req,res, function(req,res,db, next){
    db.collection('todo').drop(next);
  });
});

//////////////////////////////////////////

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

///////////////////////////////////////////



module.exports = app;
