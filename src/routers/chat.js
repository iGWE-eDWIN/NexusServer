// const express = require('express');
// const { auth, adminAuth } = require('../middleware/auth');
// const {
//   getAllChats,
//   getChatByTrackingNum,
//   sendMsg,
//   sendGeneralMsg,
//   updateChatStatus,
// } = require('../controllers/chat');

// const router = new express.Router();

// // Admin chat routes
// router.get('/chats', auth, adminAuth, getAllChats);
// router.put('/chats/:trackingNumber/status', auth, adminAuth, updateChatStatus);

// // Chat access
// router.get('/chats/:trackingNumber', getChatByTrackingNum);
// router.post('/chats/:trackingNumber/messages', sendMsg); // For shipment-specific chats

// // ✅ Add this route for general chat messages (no trackingNumber required)
// router.post('/chats/messages', sendGeneralMsg);

// module.exports = router;

// const express = require('express');
// const { auth, adminAuth } = require('../middleware/auth');
// const {
//   getAllChats,
//   getChat,
//   sendMessage,
//   createGeneralChat,
//   updateChat,
// } = require('../controllers/chat');

// const router = express.Router();

// // Admin-only routes
// router.get(
//   '/chats',
//   auth,
//   adminAuth,

//   getAllChats
// );

// router.put(
//   '/chats/:id/status',
//   auth,
//   adminAuth,

//   updateChat
// );

// // General chat routes
// router.post(
//   '/chats/general',

//   createGeneralChat
// );

// router.post('/chats/general/:id/messages', sendMessage);

// // Tracking-specific chat routes
// router.get('/chats/tracking/:trackingNumber', getChat);

// router.post(
//   '/chats/tracking/:id/messages',

//   sendMessage
// );

// // Unified chat access (works for both general and tracking chats)
// router.get('/chats/:id', auth, getChat);

// router.post('/chats/:id/messages', auth, sendMessage);

// module.exports = router;

// const express = require('express');
// const { auth, adminAuth } = require('../middleware/auth');
// const {
//   getAllChats,
//   createTrackingChat,
//   getChat,
//   sendMessage,
// } = require('../controllers/chat');

// const router = express.Router();

// // Admin-only routes
// router.get('/chats', auth, adminAuth, getAllChats);

// // Tracking chat routes
// router.post('/chats/tracking', createTrackingChat);
// router.get('/chats/tracking/:id', getChat);
// router.post('/chats/tracking/:id/messages', auth, sendMessage);

// // Unified chat routes
// router.get('/chats/:id', auth, getChat);
// router.post('/chats/:id/messages', auth, sendMessage);

// module.exports = router;

// routes/chatRoutes.js
const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const { getAllChats, getChat } = require('../controllers/chat');

const router = express.Router();

/**
 * =============================
 * ADMIN ROUTES
 * =============================
 */

// ✅ Get all general chats (admin only)
router.get('/chats', auth, adminAuth, getAllChats);

// ✅ Get specific general chat by ID (admin or frontend viewing)
router.get('/chats/:id', auth, adminAuth, getChat);

module.exports = router;
