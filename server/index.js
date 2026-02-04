import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import { initDb } from './db.js';
import boardsRouter from './routes/boards.js';
import notesRouter from './routes/notes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : '*']
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middleware
app.use(cors({
  origin: allowedOrigins
}));
app.use(express.json());

// Serve uploaded images
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Routes
app.use('/api/boards', boardsRouter);
app.use('/api', notesRouter);

// Serve static frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '..', 'client', 'dist')));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads') && !req.path.startsWith('/socket.io')) {
      res.sendFile(join(__dirname, '..', 'client', 'dist', 'index.html'));
    }
  });
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join a board room
  socket.on('join-board', (boardId) => {
    // Leave all other board rooms first
    socket.rooms.forEach(room => {
      if (room !== socket.id && room.startsWith('board-')) {
        socket.leave(room);
      }
    });
    socket.join(`board-${boardId}`);
    console.log(`Socket ${socket.id} joined board-${boardId}`);
  });

  // Leave a board room
  socket.on('leave-board', (boardId) => {
    socket.leave(`board-${boardId}`);
    console.log(`Socket ${socket.id} left board-${boardId}`);
  });

  // Note events
  socket.on('note-created', (data) => {
    if (data?.board_id) {
      socket.to(`board-${data.board_id}`).emit('note-created', data);
    }
  });

  socket.on('note-updated', (data) => {
    if (data?.board_id) {
      socket.to(`board-${data.board_id}`).emit('note-updated', data);
    }
  });

  socket.on('note-deleted', (data) => {
    if (data?.boardId) {
      socket.to(`board-${data.boardId}`).emit('note-deleted', data);
    }
  });

  // Board events
  socket.on('board-created', (data) => {
    if (data) {
      socket.broadcast.emit('board-created', data);
    }
  });

  socket.on('board-updated', (data) => {
    if (data) {
      socket.broadcast.emit('board-updated', data);
    }
  });

  socket.on('board-deleted', (data) => {
    if (data) {
      socket.broadcast.emit('board-deleted', data);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;

// Initialize database then start server
initDb().then(() => {
  console.log('Database initialized');
  httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
