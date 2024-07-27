const http = require("http");
const express = require("express");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const users = {};

io.on('connection', (socket) => {
    // Notify other users when a new user joins
    socket.on('new-user-joined', (name) => {
        users[socket.id] = name;
        io.emit('user-joined', name); // Use io.emit to broadcast to all clients
    });

    // Handle sending messages
    socket.on('send', (data) => {
        io.emit('receive', { ...data, name: users[socket.id] }); // Use io.emit to broadcast to all clients
    });

    // Notify other users when someone disconnects
    socket.on('disconnect', () => {
        io.emit('left', users[socket.id]); // Use io.emit to broadcast to all clients
        delete users[socket.id];
    });
});

app.use(express.static(path.resolve("./public")));

app.get("/", (req, res) => {
  return res.sendFile(path.join(__dirname, "/public/index.html"));
});

server.listen(9000, () => console.log(`Server Started at PORT:9000`));
