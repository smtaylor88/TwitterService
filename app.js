var app = require('express')()
    , server = require('http').Server(app)
    , io = require('socket.io').listen(server)
    , Twit = require('twit')
    , path = require('path')
    , mongodb = require('mongodb')
    , mongoose = require('mongoose');

process.env.PORT = "8888";
var port = process.env.PORT || 8888;

server.on('listening', function () {
    console.log('ok, server is running');
});

server.listen(port);
console.log('Application Listening on port %s', process.env.PORT);

// Enter the following into command.com windows...to start mongodb
// mongod --dbpath="c:\users\steve\documents\visual studio 2015\projects\expressapp1\expressapp1\mongodb"
// mongodb://<user>:<pass>@jello.modulusmongo.net:27017/anAhe2xu

//mongoose.connect('mongodb://localhost/tweet', function (err) {
    mongoose.connect('mongodb://CaptiveDBAdmin:Captive123@jello.modulusmongo.net:27017/anAhe2xu', function (err) {
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

//// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');

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

console.log('Down to the bottom...');

module.exports = app;
