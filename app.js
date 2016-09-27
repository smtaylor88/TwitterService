var app = require('express')()
    , exprss = require('express')
    , server = require('http').Server(app)
    , path = require('path')
    , dotenv = require('dotenv')
    , mongodb = require('mongodb')
    , io = require('socket.io').listen(server)
    , Twit = require('twit')
    , mongoose = require('mongoose');

// load all environment variables here (see file ./.env for values)
dotenv.load();

app.use(exprss.static('public'));
app.use(exprss.static('views'));

// by default, when running on Modulus, port 8080 is used
var port = process.env.PORT || 8080;
if (app.get("env") === 'development') {
    port = 8888;
}

server.on('listening', function () {
    console.log('ok, server is running');
});

server.listen(port);
console.log('Listening on port: %s', port);
console.log('environment: %s', process.env.NODE_ENV);

// Enter the following into command.com windows...to start mongodb on the local server
// mongod --dbpath="s:\mongodata"
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
app.get('/Index', function (req, res) {
    if (app.get("env") === 'development') {
        res.sendFile(__dirname + '/views/DevIndex.html');
    } else {
        res.sendFile(__dirname + '/views/Index.html');
    }
});

app.get('/test', function (req, res) {
    res.sendFile(__dirname + '/test.html');
});

app.get('/tweetable', function (req, res) {
    res.sendFile(__dirname + '/views/tweetableTest.html');
});

//// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');

// an array of search words
var watchList = ['#none'];

// core program call here!!!
streamTwitter();

function streamTwitter() {
    io.on('connection', function (socket) {
        console.log('Connected %s', socket.client.id);
        watchList.forEach(logArrayElements);

        socket.on('startTwitter', function (data) {
            watchList = [ data ];
            StartTwitterStream(io);
            var d = new Date();
            console.log('Start Twitter Feed: ' + watchList + ' [' + d.toTimeString() + ']');
        });

        socket.on('stopTwitter', function () {
            var d = new Date();
            console.log('Stop Twitter Feed!' + ' [' + d.toTimeString() + ']');
            stream.stop();
        });

        socket.on('restartTwitter', function () {
            var d = new Date();
            console.log('Restart Twitter Feed:' + watchList + ' [' + d.toTimeString() + ']');
            stream.start();
        });

        socket.on('disconnect', function () {
            console.log('user disconnected');
        });
    });
}

var T = new Twit({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token: process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.TWITTER_ACCESS_SECRET
})
var stream;

function StartTwitterStream(io) {
    // stream = T.stream('statuses/filter', { locations: '-122.75,6.8,-121.75,37.8' }) // san francisco
    // stream = T.stream('statuses/filter', { locations: '-122.574, 47.205, -122.444, 47.287' }) // tacoma
    stream = T.stream('statuses/filter', { track: watchList })

    stream.on('tweet', function (tweet) {
        var media;
        if (tweet.extended_entities) {
            if (tweet.extended_entities.media) {
                media = tweet.extended_entities.media;
            }
        }

        // send the tweet with images!!!
        io.emit('stream', tweet.user.screen_name, tweet.text, tweet.user.profile_image_url, tweet.created_at, tweet.user.location, media);
    });
}

function logArrayElements(element, index, arry) {
    console.log('Search Item ' + index + ': ' + element);
}