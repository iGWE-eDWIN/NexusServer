'use strict';
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');

const connectToDatabase = require('./db/mongoose');
const handleSocketConnection = require('./socket/socketHandler');
const createAdmin = require('./scripts/admin');

const authRoutes = require('./routers/auth');
const chatRoutes = require('./routers/chat');
const shipmentRoutes = require('./routers/shipment');

const app = express();
const server = createServer(app);

// ==============================
// Socket.IO Setup
// ==============================
const io = new Server(server, {
  cors: {
    origin: 'https://nexus-express.vercel.app',
    // origin: 'http://localhost:5173/',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// ==============================
// Middleware
// ==============================
app.use(
  cors({ origin: 'https://nexus-express.vercel.app', credentials: true })
);

// app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ==============================
// Routes
// ==============================
app.use(authRoutes);
app.use(chatRoutes);
app.use('/', shipmentRoutes);

// ==============================
// Health Check Route
// ==============================
app.get('/', (req, res) => {
  res.send('🚀 API is running');
});

// ==============================
// Start Server After DB Connect
// ==============================
const PORT = process.env.PORT || 5000;

connectToDatabase().then(() => {
  server.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
    // Optionally create admin user
    // createAdmin();
  });
});

// ==============================
// Socket.IO Event Handler
// ==============================
io.on('connection', (socket) => {
  handleSocketConnection(socket, io);
});
