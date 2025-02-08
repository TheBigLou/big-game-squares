import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import routes from './routes';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', routes);

// Database connection
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  throw new Error('MONGODB_URI environment variable is not set');
}

mongoose.connect(mongoUri)
  .then(() => {
    // MongoDB connected successfully
  })
  .catch((err) => {
    throw new Error(`MongoDB connection error: ${err.message}`);
  });

// Basic route
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Socket.io connection handling
io.on('connection', (socket: Socket) => {
  // Join a game room
  socket.on('join-game', (gameId: string) => {
    socket.join(gameId);
  });

  // Leave a game room
  socket.on('leave-game', (gameId: string) => {
    socket.leave(gameId);
  });
});

const PORT = process.env.PORT || 8080;

httpServer.listen(PORT, () => {
  // Server is running
}); 