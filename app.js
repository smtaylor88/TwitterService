var express = require('express')
    , app = express()
    , server = require('http').createServer(app)
    , Twit = require('twit')
    , path = require('path')
    , mongodb = require('mongodb')
    , mongoose = require('mongoose')
    , io = require('socket.io').listen(server);

process.env.PORT = "8888";
var port = process.env.PORT || 8880;
server.listen(port);
console.log('Application Listening on port %s', process.env.PORT);

// Enter the following into command.com windows...to start mongodb
// mongod --dbpath="c:\users\steve\documents\visual studio 2015\projects\expressapp1\expressapp1\mongodb"
// mongodb://<user>:<pass>@jello.modulusmongo.net:27017/anAhe2xu

mongoose.connect('mongodb://localhost/tweet', function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log('Connect to MongoDB.');
    }
});

// routing
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

var watchList = ['#trump'];
var T = new Twit({
    consumer_key: 'nHSgwpsVbY6mkYumHCjkWibgI',
    consumer_secret: 'QAdrEScuGVkkDKn0OPEYcScRpz7X36xzzbaSFrjrd21sJoOxZX',
    access_token: '1932331075-OivpoRGbgmoMMEh9Lvtg1x3mE74EJ5Gxxm4gTif',
    access_token_secret: 'PpP5hauNUhyT3RuAM7q5baSNhMDdZ2xGXNtb1gVSEa58W'
})

function logArrayElements(element, index, arry) {
    console.log('Search Item ' + index + ': ' + element);
}

io.on('connection', function (socket) {
    console.log('Connected');
    watchList.forEach(logArrayElements);

    // var stream = T.stream('statuses/filter', { locations: '-122.75,6.8,-121.75,37.8' }) // san francisco
    // var stream = T.stream('statuses/filter', { locations: '-122.11,45.8,-121.75,46.8' }) // tacoma
    var stream = T.stream('statuses/filter', { track: watchList })

    stream.on('tweet', function (tweet) {
        var media;
        if (tweet.extended_entities) {
            if (tweet.extended_entities.media) {
                media = tweet.extended_entities.media;
            }
        }

        // send the tweet with images!!!
        io.sockets.emit('stream', tweet.user.screen_name, tweet.text, tweet.user.profile_image_url, tweet.created_at, tweet.user.location, media);
    });

    socket.on('disconnect', function () {
        console.log('user disconnected');
    });

    //socket.on('reset stream', function (msg) {
    //    console.log('Reset Request Received: ' + msg);
    //});
});

module.exports = app;

//var express = require('express');
//var path = require('path');
//var favicon = require('serve-favicon');
//var logger = require('morgan');
//var cookieParser = require('cookie-parser');
//var bodyParser = require('body-parser');

//var routes = require('./routes/index');
//var users = require('./routes/users');

//var app = express();

//// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');

//// uncomment after placing your favicon in /public
////app.use(favicon(__dirname + '/public/favicon.ico'));
//app.use(logger('dev'));
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser());
//app.use(require('stylus').middleware(path.join(__dirname, 'public')));
//app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', routes);
//app.use('/users', users);

//// catch 404 and forward to error handler
//app.use(function (req, res, next) {
//    var err = new Error('Not Found');
//    err.status = 404;
//    next(err);
//});

//// error handlers

//// development error handler
//// will print stacktrace
//if (app.get('env') === 'development') {
//    app.use(function (err, req, res, next) {
//        res.status(err.status || 500);
//        res.render('error', {
//            message: err.message,
//            error: err
//        });
//    });
//}

//// production error handler
//// no stacktraces leaked to user
//app.use(function (err, req, res, next) {
//    res.status(err.status || 500);
//    res.render('error', {
//        message: err.message,
//        error: {}
//    });
//});


//module.exports = app;
