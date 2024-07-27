const http = require("http");
const express = require("express");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const users = {};

io.on('connection', (socket) => {
    // If a new user joins, let other users know
    socket.on('new-user-joined', (name) => {
        users[socket.id] = name;
        socket.broadcast.emit('user-joined', name);
    });

    // If someone sends a message, broadcast it to all
    socket.on('send', (data) => {
        if (data.type === 'message') {
            socket.broadcast.emit('receive', { type: 'message', data: data.data, name: users[socket.id] });
        } else if (data.type === 'file') {
            // Broadcast file as binary data
            socket.broadcast.emit('receive', { type: 'file', data: data.data, fileName: data.fileName, name: users[socket.id] });
        }
    });

    // If someone leaves the chat, let others know
    socket.on('disconnect', () => {
        socket.broadcast.emit('left', users[socket.id]);
        delete users[socket.id];
    });
});

app.use(express.static(path.resolve("./public")));

app.get("/", (req, res) => {
    return res.sendFile(path.join(__dirname, "/public/index.html"));
});

server.listen(9000, () => console.log(`Server Started at PORT:9000`));
