const http = require("http");
const express = require("express");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const users = {};

io.on('connection', (socket) => {
    //if any new user join  let other user know about this
    socket.on('new-user-joined', (name) => {
        users[socket.id] = name;
        socket.broadcast.emit('user-joined', name);
    });
// if someone sends a message broadcast all
    socket.on('send', message => {
        socket.broadcast.emit('receive', { message: message, name: users[socket.id] });
    });
//if someone leave the chat broadcast others
    socket.on('disconnect', () => {
        socket.broadcast.emit('left',users[socket.id]);
        delete users[socket.id];
    });
});


app.use(express.static(path.resolve("./public")));

app.get("/", (req, res) => {
  return res.sendFile(path.join(__dirname, "/public/index.html"));
});

server.listen(9000, () => console.log(`Server Started at PORT:9000`));
