require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const http = require("http");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.set("io", io);   

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("trackShipment", (trackingId) => {

    socket.join(trackingId);

    console.log("User joined shipment room:", trackingId);

});

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});