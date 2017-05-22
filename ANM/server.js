var express = require("express");
var app = express();
var path = require("path");
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require("fs");

var list_socket = [];

app.get('/', function (req, res) {
    var data = fs.readFileSync(__dirname + '/index.html', 'utf-8');
    var name_socket_random = Math.floor(Math.random() * 1000 + 1);
    data = data.replace("{name}", name_socket_random);
    names = name_socket_random;
    res.end(data)
});

// app.get('/css/style.css', function (req, res) {
//     res.sendFile(path.join(__dirname + '/css/style.css'));
// });
app.get('/css/:filename', function (req, res) {
    // res.sendFile(path.join(__dirname + '/css/style.css'));
    var file_path = path.join(__dirname + '/css/' + req.params.filename);
    try{
        fs.accessSync(file_path);
        res.sendFile(file_path);
    }
    catch (err) {
        console.log(err);
        res.end('No file: ' + req.params.filename);
    }
});

app.get('/js/:filename', function (req, res) {
    var file_path = path.join(__dirname + '/js/' + req.params.filename);
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
    console.log(socket.username);
    socket.on('chat message', function (msg) {
        console.log('message: ' + msg.username);
        for (var i = 0; i < list_socket.length; i++) {
            if (list_socket[i] != socket) {
                list_socket[i].emit('chat message', msg);
            }
        }
    });
    socket.on('disconnect', function () {
        console.log('user disconnected');
        for (var i = 0; i < list_socket.length; i++) {
            if (list_socket[i].id == socket.id) {
                list_socket.splice(i, 1);
                console.log('remove socket '+ i.toString())
                break;
            }
        }
    });
});
http.listen(3000, function () {
    console.log('listening on localhost:3000');
});
