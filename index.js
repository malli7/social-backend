import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import Users from './Routes/Users.js';
import Posts from './Routes/Posts.js';
import { Server } from "socket.io";



const PORT = process.env.PORT || 5000;
const mongoURI = process.env.URL;
const app = express();
app.use(express());
app.use(express.json());
app.use(cors());


mongoose.set("strictQuery", true);
mongoose.connect(mongoURI, () => {
    console.log("connected to mongo");
});

app.use('/users', Users);
app.use('/posts', Posts);


const server = app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
});

const io = new Server(server, {
    cors: {
        origin: "https://social-id7k.onrender.com",
        Credentials: true
    }
})

global.onlineUsers = new Map();
io.on("connection", (socket) => {
    global.chatsocket = socket;
    socket.on("addUser", (id) => {
        onlineUsers.set(id, socket.id);
        console.log(onlineUsers);

    })
    socket.on("send-msg", (data) => {
        const sendUserSocket = onlineUsers.get(data.to);
        if (sendUserSocket) {
            socket.to(sendUserSocket).emit("msg-recieve", data.message);
        }
    })
})