const { randomInt } = require('crypto');
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var cookie = require('cookie');

let usernames = []
let messages = []

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.use(express.static('public'));

io.on('connection', (socket) => {
    let addedUser = false;
    cookie = socket.request.headers.cookie;
    if (cookie) {
        oldName = cookie.split("=")[1];
        if (oldName) {
            socket.username = oldName;
        }
    }
    else {
        socket.username = randomInt(1000).toString();
    }

    socket.on('add user', () => {
        if (addedUser) return;

        socket.colour = '000000';
        usernames.push(socket.username);
        addedUser = true;
        socket.emit('welcome', socket.username, messages);
        io.emit('new user', usernames);
    });
    socket.on('new message', (msg) => {
        message = {
            username: socket.username,
            message: msg,
            colour: socket.colour,
            timestamp: timeStamp()
        }
        console.log(socket.colour);
        messages.push(message);
        io.emit('new message', messages);
    });
    socket.on('changed name', (newName) => {
        let userIndex = usernames.indexOf(socket.username);
        messages.forEach(element => {
            if (element.username == socket.username) {
                element.username = newName;
            }
        });
        socket.username = newName;
        console.log(userIndex);
        usernames[userIndex] = socket.username;
        io.emit('changed name', usernames);
        io.emit('new message', messages);
        console.log(usernames);
    });
    socket.on('changed colour', (newColour) => {
        messages.forEach(element => {
            if (element.username == socket.username) {
                element.colour = newColour;
            }
        });
        io.emit('new message', messages);
        socket.colour = newColour;
    })
    socket.on('disconnect', () => {
        if (addedUser) {
            let userIndex = usernames.indexOf(socket.username);
            usernames.splice(userIndex, 1);
            io.emit('user left', usernames);
        }
    })
});

http.listen(3000, () => {
    console.log('listening on *:3000');
});

function timeStamp() {
    let date = new Date();
    let hours = date.getHours();
    if (hours < 10) {
        hours = '0' + hours;
    }
    let mins = date.getMinutes();
    if (mins < 10) {
        mins = '0' + mins;
    }
    let secs = date.getSeconds();
    if (secs < 10) {
        secs = '0' + secs;
    }
    return hours + ':' + mins + ':' + secs + ' ';
}