"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const routes_1 = __importDefault(require("./routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || '*',
        methods: ['GET', 'POST']
    }
});
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// API Routes
app.use('/api', routes_1.default);
// Database connection
const mongoUri = process.env.MONGODB_URI;
console.log('MongoDB URI exists:', !!mongoUri); // Log if URI exists (don't log the actual URI)
if (!mongoUri) {
    console.error('MONGODB_URI environment variable is not set');
    process.exit(1);
}
mongoose_1.default.connect(mongoUri)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});
// Basic route
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('Client connected');
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
    // Join a game room
    socket.on('join-game', (gameId) => {
        socket.join(gameId);
    });
    // Leave a game room
    socket.on('leave-game', (gameId) => {
        socket.leave(gameId);
    });
});
const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
