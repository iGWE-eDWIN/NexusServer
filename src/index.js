// 'use strict';
// require('dotenv').config();

// const express = require('express');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const { createServer } = require('http');
// const { Server } = require('socket.io');
// const createAdmin = require('./scripts/admin.js');
// const newDataBase = require('./db/mongoose.js');
// const authRoute = require('./routers/auth');
// const chatRoute = require('./routers/chat.js');
// const shipmentRoute = require('./routers/shipment.js');

// // Import socket handlers
// const handleSocketConnection = require('./socket/socketHandler');

// const app = express();
// const server = createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: 'http://localhost:5173',
//     methods: ['GET', 'POST'],
//     credentials: true,
//   },
// });

// app.use(
//   cors({
//     origin: 'http://localhost:5173',
//     credentials: false,
//   })
// );
// app.use(express.json());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// //Routers
// app.use(authRoute);
// app.use(chatRoute);
// app.use('/', shipmentRoute);

// const port = process.env.PORT || 5000;

// // Socket.IO connection handling
// io.on('connection', (socket) => {
//   handleSocketConnection(socket, io);
// });

// app.get('/', (req, res) => {
//   res.send('Hello there');
// });

// // ✅ Connect DB first, then start the server and create admin
// newDataBase().then(() => {
//   server.listen(port, () => {
//     console.log(`🚀 Server running at port ${port}`);
//     // createAdmin(); // Ensure DB is ready before creating
//   });
// });

// // app.listen(port, () => {
// //   console.log(`server running at port ${port}`);
// // });

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

// app.use(cors({ origin: ' http://localhost:5173', credentials: true }));
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
