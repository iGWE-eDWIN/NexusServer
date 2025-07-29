// // const Chat = require('../models/chat');

// // // Get all chats (admin only)
// // const getAllChats = async (req, res) => {
// //   try {
// //     const { status = 'all' } = req.query;

// //     // Build query object conditionally
// //     const query = status !== 'all' ? { status } : {};
// //     // let query = {};
// //     // if (status !== 'all') {
// //     //   query.status = status;
// //     // }

// //     const chats = await Chat.find(query)
// //       .sort({ lastActivity: -1 })
// //       .populate('assignedAdmin', 'username');

// //     res.status(200).send({ chats });
// //   } catch (error) {
// //     console.error('Get chats error:', error);
// //     res.status(500).send({ message: 'Server error' });
// //   }
// // };

// // // Get chat by tracking number
// // const getChatByTrackingNum = async (req, res) => {
// //   try {
// //     const { trackingNumber } = req.params;

// //     if (!trackingNumber) {
// //       return res.status(400).send({ message: 'Tracking number is required' });
// //     }

// //     // Try to find existing chat
// //     let chat = await Chat.findOne({
// //       trackingNumber: trackingNumber.toUpperCase(),
// //     });

// //     // If not found, create a new empty chat
// //     if (!chat) {
// //       chat = new Chat({
// //         trackingNumber: trackingNumber.toUpperCase(),
// //         messages: [],
// //         status: 'open',
// //       });
// //       await chat.save();
// //     }

// //     res.status(200).send({ success: true, chat });
// //   } catch (error) {
// //     console.error('Get chat error:', error);
// //     res.status(500).send({ message: 'Server error' });
// //   }
// // };

// // // Send message
// // const sendMsg = async (req, res) => {
// //   try {
// //     const { trackingNumber } = req.params;

// //     if (!trackingNumber) {
// //       return res.status(400).send({ message: 'Tracking number is required' });
// //     }

// //     const {
// //       sender,
// //       message,
// //       isAdmin = false,
// //       customerName,
// //       customerEmail,
// //     } = req.body;

// //     // Validate required fields
// //     if (!sender || !message) {
// //       return res
// //         .status(400)
// //         .send({ message: 'Sender and message are required' });
// //     }

// //     // Find pr create chat
// //     let chat = await Chat.findOne({
// //       trackingNumber: trackingNumber.toUpperCase(),
// //     });

// //     if (!chat) {
// //       chat = new Chat({
// //         trackingNumber: trackingNumber.toUpperCase(),
// //         customerName,
// //         customerEmail,
// //         messages: [],
// //       });
// //     }

// //     // Add customer info if not already set
// //     if (customerName && !chat.customerName) {
// //       chat.customerName = customerName;
// //     }
// //     if (customerEmail && !chat.customerEmail) {
// //       chat.customerEmail = customerEmail;
// //     }

// //     // Push new message
// //     chat.messages.push({
// //       sender,
// //       message,
// //       isAdmin,
// //       timestamp: new Date(),
// //     });

// //     chat.lastActivity = new Date();

// //     await chat.save();
// //     res.status(200).send({ success: true, message: chat.messages.at(-1) });
// //   } catch (error) {
// //     console.error('Send message error:', error);
// //     res.status(500).json({ message: 'Server error' });
// //   }
// // };

// // // Send general message (without tracking number)
// // const sendGeneralMsg = async (req, res) => {
// //   try {
// //     const {
// //       sender,
// //       message,
// //       isAdmin = false,
// //       customerName,
// //       customerEmail,
// //     } = req.body;

// //     if (!sender || !message) {
// //       return res
// //         .status(400)
// //         .send({ message: 'Sender and message are required' });
// //     }

// //     let chat = await Chat.findOne({ isGeneral: true });

// //     if (!chat) {
// //       chat = new Chat({
// //         isGeneral: true,
// //         messages: [],
// //         customerName,
// //         customerEmail,
// //         status: 'open',
// //       });
// //     }

// //     chat.messages.push({
// //       sender,
// //       message,
// //       isAdmin,
// //       timestamp: new Date(),
// //     });

// //     chat.lastActivity = new Date();

// //     if (customerName && !chat.customerName) {
// //       chat.customerName = customerName;
// //     }
// //     if (customerEmail && !chat.customerEmail) {
// //       chat.customerEmail = customerEmail;
// //     }

// //     await chat.save();
// //     res.status(200).send({ success: true, message: chat.messages.at(-1) });
// //   } catch (error) {
// //     console.error('Send general message error:', error);
// //     res.status(500).json({ message: 'Server error' });
// //   }
// // };

// // // Update chat status (admin only)
// // const updateChatStatus = async (req, res) => {
// //   try {
// //     const { trackingNumber } = req.params;
// //     const { status, assignedAdmin } = req.body;

// //     // Validate tracking number
// //     if (!trackingNumber) {
// //       return res.status(400).json({ message: 'Tracking number is required' });
// //     }

// //     const chat = await Chat.findOneAndUpdate(
// //       { trackingNumber: trackingNumber.toUpperCase() },
// //       { status, assignedAdmin },
// //       { new: true }
// //     ).populate('assignedAdmin', 'username');

// //     if (!chat) {
// //       return res.status(404).send({ message: 'Chat not found' });
// //     }

// //     res.status(200).send({ success: true, chat });
// //   } catch (error) {
// //     console.error('Update chat status error:', error);
// //     res.status(500).json({ message: 'Server error' });
// //   }
// // };

// // module.exports = {
// //   getAllChats,
// //   getChatByTrackingNum,
// //   sendMsg,
// //   sendGeneralMsg,
// //   updateChatStatus,
// // };

// const Chat = require('../models/chat');

// // Get all chats (admin only)
// const getAllChats = async (req, res) => {
//   try {
//     const { status, isGeneral, assignedAdmin, lastActivityAfter } = req.query;

//     // Build query with filters
//     const query = {};

//     if (status && ['open', 'closed', 'pending'].includes(status)) {
//       query.status = status;
//     }

//     if (isGeneral === 'true') {
//       query.isGeneral = true;
//     } else if (isGeneral === 'false') {
//       query.isGeneral = false;
//     }

//     if (assignedAdmin) {
//       query.assignedAdmin = assignedAdmin;
//     }

//     if (lastActivityAfter) {
//       query.lastActivity = { $gte: new Date(lastActivityAfter) };
//     }

//     const chats = await Chat.find(query)
//       .sort({ lastActivity: -1 })
//       .populate('assignedAdmin', 'username email')
//       .lean();

//     // Add unread count for admin
//     if (req.user?.isAdmin) {
//       chats.forEach((chat) => {
//         chat.unreadCount = chat.messages.reduce(
//           (count, msg) => (!msg.isRead && !msg.isAdmin ? count + 1 : count),
//           0
//         );
//       });
//     }

//     res.status(200).json({
//       success: true,
//       count: chats.length,
//       chats,
//     });
//   } catch (error) {
//     console.error('Get chats error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to retrieve chats',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined,
//     });
//   }
// };

// // Get chat by ID or tracking number
// const getChat = async (req, res) => {
//   try {
//     const { id, trackingNumber } = req.params;

//     if (!id && !trackingNumber) {
//       return res.status(400).json({
//         success: false,
//         message: 'Either chat ID or tracking number is required',
//       });
//     }

//     const query = id
//       ? { _id: id }
//       : {
//           trackingNumber: trackingNumber.toUpperCase(),
//         };

//     const chat = await Chat.findOne(query)
//       .populate('assignedAdmin', 'username email')
//       .lean();

//     if (!chat) {
//       return res.status(404).json({
//         success: false,
//         message: 'Chat not found',
//       });
//     }

//     // Mark messages as read if accessed by admin
//     if (req.user?.isAdmin) {
//       const unreadMessages = chat.messages
//         .filter((msg) => !msg.isRead && !msg.isAdmin)
//         .map((msg) => msg._id);

//       if (unreadMessages.length > 0) {
//         await Chat.updateOne(
//           { _id: chat._id },
//           { $set: { 'messages.$[elem].isRead': true } },
//           { arrayFilters: [{ 'elem._id': { $in: unreadMessages } }] }
//         );
//       }
//     }

//     res.status(200).json({
//       success: true,
//       chat,
//     });
//   } catch (error) {
//     console.error('Get chat error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to retrieve chat',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined,
//     });
//   }
// };

// // Send message to existing chat
// const sendMessage = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { content, isAdmin = false } = req.body;
//     const sender = isAdmin ? req.user._id : req.body.sender;

//     if (!content || content.length > 1000) {
//       return res.status(400).json({
//         success: false,
//         message: 'Valid message content is required (1-1000 characters)',
//       });
//     }

//     const chat = await Chat.findByIdAndUpdate(
//       id,
//       {
//         $push: {
//           messages: {
//             sender,
//             content,
//             isAdmin,
//             isRead: isAdmin, // Admin messages are marked as read by default
//           },
//         },
//         $set: {
//           lastActivity: new Date(),
//           status: 'open',
//         },
//       },
//       { new: true, runValidators: true }
//     ).populate('messages.sender', 'username');

//     if (!chat) {
//       return res.status(404).json({
//         success: false,
//         message: 'Chat not found',
//       });
//     }

//     const newMessage = chat.messages[chat.messages.length - 1];

//     res.status(201).json({
//       success: true,
//       message: newMessage,
//     });

//     // Notify via socket if real-time update needed
//     // (Socket emission would typically be handled in the route handler)
//   } catch (error) {
//     console.error('Send message error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to send message',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined,
//     });
//   }
// };

// // Create new general chat
// const createGeneralChat = async (req, res) => {
//   try {
//     const { username, customerName, customerEmail } = req.body;

//     if (!username) {
//       return res.status(400).json({
//         success: false,
//         message: 'Username is required for general chat',
//       });
//     }

//     // Check for existing general chat for this user
//     let chat = await Chat.findOne({
//       isGeneral: true,
//       username,
//     });

//     if (!chat) {
//       chat = new Chat({
//         isGeneral: true,
//         username,
//         customerName,
//         customerEmail,
//         messages: [],
//         status: 'open',
//       });
//       await chat.save();
//     }

//     res.status(200).json({
//       success: true,
//       chat,
//     });
//   } catch (error) {
//     console.error('Create general chat error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to create general chat',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined,
//     });
//   }
// };

// // Update chat status or assignment
// const updateChat = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status, assignedAdmin } = req.body;

//     const updates = {};
//     if (status && ['open', 'closed', 'pending'].includes(status)) {
//       updates.status = status;
//     }
//     if (assignedAdmin) {
//       updates.assignedAdmin = assignedAdmin;
//     }

//     if (Object.keys(updates).length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'No valid updates provided',
//       });
//     }

//     const chat = await Chat.findByIdAndUpdate(id, updates, {
//       new: true,
//       runValidators: true,
//     }).populate('assignedAdmin', 'username email');

//     if (!chat) {
//       return res.status(404).json({
//         success: false,
//         message: 'Chat not found',
//       });
//     }

//     res.status(200).json({
//       success: true,
//       chat,
//     });
//   } catch (error) {
//     console.error('Update chat error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to update chat',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined,
//     });
//   }
// };

// module.exports = {
//   getAllChats,
//   getChat,
//   sendMessage,
//   createGeneralChat,
//   updateChat,
// };

// const Chat = require('../models/chat');

// // Get all chats (admin only)
// const getAllChats = async (req, res) => {
//   try {
//     const { status, isGeneral, assignedAdmin, lastActivityAfter } = req.query;

//     // Build query with filters
//     const query = {};

//     if (status && ['open', 'closed', 'pending'].includes(status)) {
//       query.status = status;
//     }

//     if (isGeneral === 'true') {
//       query.isGeneral = true;
//     } else if (isGeneral === 'false') {
//       query.isGeneral = false;
//     }

//     if (assignedAdmin) {
//       query.assignedAdmin = assignedAdmin;
//     }

//     if (lastActivityAfter) {
//       query.lastActivity = { $gte: new Date(lastActivityAfter) };
//     }

//     const chats = await Chat.find(query)
//       .sort({ lastActivity: -1 })
//       .populate('assignedAdmin', 'username email')
//       .lean();

//     // Add unread count for admin
//     if (req.user?.isAdmin) {
//       chats.forEach((chat) => {
//         chat.unreadCount = chat.messages.reduce(
//           (count, msg) => (!msg.isRead && !msg.isAdmin ? count + 1 : count),
//           0
//         );
//       });
//     }

//     res.status(200).json({
//       success: true,
//       count: chats.length,
//       chats,
//     });
//   } catch (error) {
//     console.error('Get chats error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to retrieve chats',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined,
//     });
//   }
// };

// // Get chat by ID or tracking number
// const getChat = async (req, res) => {
//   try {
//     const { id, trackingNumber } = req.params;

//     if (!id && !trackingNumber) {
//       return res.status(400).json({
//         success: false,
//         message: 'Either chat ID or tracking number is required',
//       });
//     }

//     const query = id
//       ? { _id: id }
//       : {
//           trackingNumber: trackingNumber.toUpperCase(),
//         };

//     const chat = await Chat.findOne(query)
//       .populate('assignedAdmin', 'username email')
//       .lean();

//     if (!chat) {
//       return res.status(404).json({
//         success: false,
//         message: 'Chat not found',
//       });
//     }

//     // Mark messages as read if accessed by admin
//     if (req.user?.isAdmin) {
//       const unreadMessages = chat.messages
//         .filter((msg) => !msg.isRead && !msg.isAdmin)
//         .map((msg) => msg._id);

//       if (unreadMessages.length > 0) {
//         await Chat.updateOne(
//           { _id: chat._id },
//           { $set: { 'messages.$[elem].isRead': true } },
//           { arrayFilters: [{ 'elem._id': { $in: unreadMessages } }] }
//         );
//       }
//     }

//     res.status(200).json({
//       success: true,
//       chat,
//     });
//   } catch (error) {
//     console.error('Get chat error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to retrieve chat',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined,
//     });
//   }
// };

// // Send message to existing chat
// const sendMessage = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { content, isAdmin = false } = req.body;
//     const sender = isAdmin ? req.user._id : req.body.sender;

//     if (!content || content.length > 1000) {
//       return res.status(400).json({
//         success: false,
//         message: 'Valid message content is required (1-1000 characters)',
//       });
//     }

//     const chat = await Chat.findByIdAndUpdate(
//       id,
//       {
//         $push: {
//           messages: {
//             sender,
//             content,
//             isAdmin,
//             isRead: isAdmin, // Admin messages are marked as read by default
//           },
//         },
//         $set: {
//           lastActivity: new Date(),
//           status: 'open',
//         },
//       },
//       { new: true, runValidators: true }
//     ).populate('messages.sender', 'username');

//     if (!chat) {
//       return res.status(404).json({
//         success: false,
//         message: 'Chat not found',
//       });
//     }

//     const newMessage = chat.messages[chat.messages.length - 1];

//     res.status(201).json({
//       success: true,
//       message: newMessage,
//     });

//     // Notify via socket if real-time update needed
//     // (Socket emission would typically be handled in the route handler)
//   } catch (error) {
//     console.error('Send message error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to send message',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined,
//     });
//   }
// };

// // Create new general chat
// const createGeneralChat = async (req, res) => {
//   try {
//     const { username, customerName, customerEmail } = req.body;

//     if (!username) {
//       return res.status(400).json({
//         success: false,
//         message: 'Username is required for general chat',
//       });
//     }

//     // Check for existing general chat for this user
//     let chat = await Chat.findOne({
//       isGeneral: true,
//       username,
//     });

//     if (!chat) {
//       chat = new Chat({
//         isGeneral: true,
//         username,
//         customerName,
//         customerEmail,
//         messages: [],
//         status: 'open',
//       });
//       await chat.save();
//     }

//     res.status(200).json({
//       success: true,
//       chat,
//     });
//   } catch (error) {
//     console.error('Create general chat error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to create general chat',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined,
//     });
//   }
// };

// // Update chat status or assignment
// const updateChat = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status, assignedAdmin } = req.body;

//     const updates = {};
//     if (status && ['open', 'closed', 'pending'].includes(status)) {
//       updates.status = status;
//     }
//     if (assignedAdmin) {
//       updates.assignedAdmin = assignedAdmin;
//     }

//     if (Object.keys(updates).length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'No valid updates provided',
//       });
//     }

//     const chat = await Chat.findByIdAndUpdate(id, updates, {
//       new: true,
//       runValidators: true,
//     }).populate('assignedAdmin', 'username email');

//     if (!chat) {
//       return res.status(404).json({
//         success: false,
//         message: 'Chat not found',
//       });
//     }

//     res.status(200).json({
//       success: true,
//       chat,
//     });
//   } catch (error) {
//     console.error('Update chat error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to update chat',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined,
//     });
//   }
// };

// module.exports = {
//   getAllChats,
//   getChat,
//   sendMessage,
//   createGeneralChat,
//   updateChat,
// };

// const Chat = require('../models/chat');

// // Get all chats (admin only)
// const getAllChats = async (req, res) => {
//   try {
//     const { status, isGeneral, assignedAdmin, lastActivityAfter } = req.query;

//     const query = {};

//     if (status && ['open', 'closed', 'pending'].includes(status)) {
//       query.status = status;
//     }

//     if (isGeneral === 'true') query.isGeneral = true;
//     if (isGeneral === 'false') query.isGeneral = false;
//     if (assignedAdmin) query.assignedAdmin = assignedAdmin;
//     if (lastActivityAfter)
//       query.lastActivity = { $gte: new Date(lastActivityAfter) };

//     const chats = await Chat.find(query)
//       .sort({ lastActivity: -1 })
//       .populate('assignedAdmin', 'username email')
//       .lean();

//     // Add unread count for admin
//     if (req.user?.isAdmin) {
//       chats.forEach((chat) => {
//         chat.unreadCount = chat.messages.reduce(
//           (count, msg) => (!msg.isRead && !msg.isAdmin ? count + 1 : count),
//           0
//         );
//       });
//     }

//     res.status(200).json({ success: true, count: chats.length, chats });
//   } catch (error) {
//     console.error('Get chats error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to retrieve chats',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined,
//     });
//   }
// };

// // Create new tracking chat
// const createTrackingChat = async (req, res) => {
//   try {
//     const { trackingNumber } = req.body;

//     let chat = await Chat.findOne({ trackingNumber });

//     if (!chat) {
//       chat = new Chat({
//         trackingNumber,
//         messages: [],
//         status: 'open',
//       });
//       await chat.save();
//     }

//     res.status(200).json({ success: true, chat });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Error creating tracking chat',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined,
//     });
//   }
// };

// // Unified get chat (works for both general and tracking)
// const getChat = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const chat = await Chat.findById(id)
//       .populate('assignedAdmin', 'username email')
//       .lean();

//     if (!chat)
//       return res
//         .status(404)
//         .json({ success: false, message: 'Chat not found' });

//     // Mark messages as read if accessed by admin
//     if (req.user?.isAdmin) {
//       const unreadMessages = chat.messages
//         .filter((msg) => !msg.isRead && !msg.isAdmin)
//         .map((msg) => msg._id);

//       if (unreadMessages.length > 0) {
//         await Chat.updateOne(
//           { _id: chat._id },
//           { $set: { 'messages.$[elem].isRead': true } },
//           { arrayFilters: [{ 'elem._id': { $in: unreadMessages } }] }
//         );
//       }
//     }

//     res.status(200).json({ success: true, chat });
//   } catch (error) {
//     console.error('Get chat error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to retrieve chat',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined,
//     });
//   }
// };

// // Unified send message (works for both chat types)
// const sendMessage = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { content, isAdmin = false } = req.body;
//     const sender = isAdmin ? req.user._id : req.body.sender;

//     if (!content || content.length > 1000) {
//       return res.status(400).json({
//         success: false,
//         message: 'Valid message content is required (1-1000 characters)',
//       });
//     }

//     const chat = await Chat.findByIdAndUpdate(
//       id,
//       {
//         $push: { messages: { sender, content, isAdmin, isRead: isAdmin } },
//         $set: { lastActivity: new Date(), status: 'open' },
//       },
//       { new: true, runValidators: true }
//     ).populate('messages.sender', 'username');

//     if (!chat) {
//       return res
//         .status(404)
//         .json({ success: false, message: 'Chat not found' });
//     }

//     const newMessage = chat.messages[chat.messages.length - 1];
//     res.status(201).json({ success: true, message: newMessage });
//   } catch (error) {
//     console.error('Send message error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to send message',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined,
//     });
//   }
// };

// module.exports = {
//   getAllChats,
//   createTrackingChat,
//   getChat,
//   sendMessage,
// };

const Chat = require('../models/chat');

// OPTIONAL: Get all chats (only for admin dashboard view)
const getAllChats = async (req, res) => {
  try {
    const chats = await Chat.find().sort({ lastActivity: -1 });
    res.status(200).send({ success: true, chats });
  } catch (err) {
    console.error('❌ getAllChats error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch chats' });
  }
};

// OPTIONAL: Get chat by ID for inspection (admin)
const getChat = async (req, res) => {
  try {
    const { id } = req.params;
    const chat = await Chat.findById(id);

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.status(200).json(chat);
  } catch (err) {
    console.error('❌ getChat error:', err);
    res.status(500).json({ error: 'Failed to retrieve chat' });
  }
};

module.exports = {
  getAllChats,
  getChat,
};
