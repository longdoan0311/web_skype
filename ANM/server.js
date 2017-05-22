var express = require("express");
var app = express();
var path = require("path");
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require("fs");
var mysql = require('mysql');
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
var session = require('express-session');
app.use(session({
    secret: '2C44-4D44-WppQ38S',
    resave: true,
    saveUninitialized: true
}));

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'chat_user',
    password: 'passW0rd',
    database: 'chat_db'
});
connection.connect();

// Authentication and Authorization Middleware
var auth = function (req, res, next) {
    if (req.session && req.session.user)
        return next();
    else
        return res.redirect('/');
};

var list_socket = [];

app.get('/', function (req, res) {
    if (req.session && req.session.user) {
        return res.redirect('/chat');
    }
    else
        res.sendFile(path.join(__dirname + '/login.html'));
    // console.log(Math.floor(Math.random() * 1000 + 1));
});

//Handle
app.post('/login', function (request, response) {
    var user_name = request.body.user;
    var password = request.body.pass;
    console.log(user_name);
    request.session.user = undefined;
    if (user_name) {
        if (password) {
            var user = {login: user_name, password: password};
            console.log(user);
            connection.query('SELECT id from users WHERE login = ? and password = ?', [user_name, password], function (error, record) {
                if (error) {
                    console.log(err);
                    response.end('501');
                }
                else {
                    request.session.user = user_name;
                    response.send("200");
                    // response.send("login success!");
                    // response.end('200');
                }
            });
        }
    }
});

/*code:
 200: add user ok,
 500: error when insert user
 501: error when check duplicate
 502: duplicate login user
 */
app.post('/register', function (request, response) {
    var body = request.body;
    var user_name = body.user;
    var password = body.pass;
    console.log(user_name);
    if (user_name) {
        if (password) {
            var user = {login: user_name, password: password};
            console.log(user);
            connection.query('SELECT id from users WHERE login = ?', user_name, function (error, record) {
                if (error) {
                    console.log(err);
                    response.end('501');
                }
                else {
                    if (record.length === 0) {
                        connection.query('INSERT INTO users SET ?', user, function (err, rec) {
                            if (err) {
                                console.log(err);
                                response.end('500');
                            }
                            else
                                console.log('Last insert ID:', rec.insertId);
                            response.end('200');
                        });
                    } else {
                        response.end('502');
                    }
                }
            });
        }
    }

});

app.get('/chat', auth, function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/:dir_path/:filename', function (req, res) {
    var file_path = path.join(__dirname + '/' + req.params.dir_path + '/' + req.params.filename);
    try {
        fs.accessSync(file_path);
        res.sendFile(file_path);
    }
    catch (err) {
        console.log(err);
        res.end('No file: ' + req.params.filename);
    }
});

io.on('connection', function (socket) {
    console.log('a user connected');
    list_socket.push(socket);
    console.log(socket.id);
    socket.on('chat.message', function (msg) {
        console.log('message: ' + msg);
        for (var i = 0; i < list_socket.length; i++) {
            if (list_socket[i] !== socket) {
                list_socket[i].emit('chat.message', msg);
            }
        }
    });
    socket.on('disconnect', function () {
        console.log('user disconnected');
        for (var i = 0; i < list_socket.length; i++) {
            if (list_socket[i].id === socket.id) {
                list_socket.splice(i, 1);
                console.log('remove socket ' + i.toString());
                break;
            }
        }
    });
});

//noinspection JSUnresolvedFunction
http.listen(3000, function () {
    console.log('listening on localhost:3000');
});
