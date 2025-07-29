// // socketHandler.js
// const Chat = require('../models/chat');

// const handleSocketConnection = (socket, io) => {
//   console.log('✅ User connected:', socket.id);

//   let userType = 'user';
//   const userRooms = new Set();

//   // Admin joins
//   socket.on('admin-join', (adminData) => {
//     try {
//       if (!adminData?.adminId) throw new Error('Admin authentication required');

//       socket.join('admin-room');
//       userType = 'admin';
//       userRooms.add('admin-room');

//       console.log(`🛡️ Admin connected: ${adminData.adminId}`);
//     } catch (error) {
//       console.error('Admin join error:', error.message);
//       socket.emit('error', { message: error.message });
//     }
//   });

//   // User joins a general room
//   socket.on('user-join', async ({ username }) => {
//     try {
//       if (!username) throw new Error('Username is required');

//       const room = `general-${username}`;
//       socket.join(room);
//       userRooms.add(room);

//       console.log(`👤 User joined general room: ${room}`);

//       // Notify admin
//       io.to('admin-room').emit('new-chat', {
//         room,
//         isGeneral: true,
//         userIdentifier: username,
//         timestamp: new Date(),
//       });
//     } catch (error) {
//       console.error('User join error:', error.message);
//       socket.emit('error', { message: error.message });
//     }
//   });

//   // Send message
//   socket.on('send-message', async (msgData) => {
//     try {
//       const { room, sender, content, username, isAdmin, adminId } = msgData;

//       const chatUpdate = {
//         $push: {
//           messages: {
//             sender,
//             content,
//             isAdmin: !!isAdmin,
//             ...(isAdmin && { adminId }),
//             timestamp: new Date(),
//           },
//         },
//         $set: {
//           lastActivity: new Date(),
//           ...(isAdmin && {
//             status: 'replied',
//             lastAdminReply: new Date(),
//           }),
//         },
//       };

//       const chat = await Chat.findOneAndUpdate({ username }, chatUpdate, {
//         new: true,
//         upsert: true,
//       });

//       const messagePayload = {
//         chatId: chat._id,
//         room,
//         sender,
//         content,
//         isAdmin: !!isAdmin,
//         username,
//         timestamp: new Date(),
//         replied: !!isAdmin,
//       };

//       io.to(room).emit('new-message', messagePayload);

//       if (!isAdmin) {
//         io.to('admin-room').emit('new-message', {
//           ...messagePayload,
//           isUserMessage: true,
//         });
//       } else {
//         io.to('admin-room').emit('message-replied', {
//           username,
//           chatId: chat._id,
//         });
//       }
//     } catch (error) {
//       console.error('Message error:', error.message);
//       socket.emit('error', { message: error.message });
//     }
//   });

//   socket.on('disconnect', () => {
//     console.log(`❎ ${userType} disconnected: ${socket.id}`);
//     userRooms.forEach((room) => socket.leave(room));
//     userRooms.clear();
//   });
// };

// module.exports = handleSocketConnection;

const Chat = require('../models/chat');

// Helper function for error handling
const handleError = (socket, errorType, error) => {
  console.error(`⚠️ ${errorType}:`, error.message);
  socket.emit('socket-error', {
    type: errorType,
    message: error.message,
    timestamp: new Date(),
  });
};

const handleSocketConnection = (socket, io) => {
  console.log('✅ User connected:', socket.id);
  let userType = 'user';
  const userRooms = new Set();
  let currentUser = null;

  // Admin authentication and join
  socket.on('admin-join', async (adminData) => {
    try {
      if (!adminData?.adminId) {
        throw new Error('Admin credentials required');
      }

      // Verify admin privileges (you would add actual verification logic here)
      const isVerifiedAdmin = true; // Replace with real verification
      if (!isVerifiedAdmin) {
        throw new Error('Admin verification failed');
      }

      socket.join('admin-room');
      userRooms.add('admin-room');
      userType = 'admin';
      currentUser = { id: adminData.adminId, type: 'admin' };

      console.log(`🛡️ Admin connected: ${adminData.adminId}`);

      // Notify admin of their successful connection
      socket.emit('admin-connected', {
        message: 'Admin session established',
        timestamp: new Date(),
      });
    } catch (error) {
      handleError(socket, 'admin-join-error', error);
    }
  });

  // User join handler
  socket.on('user-join', async ({ username, userId }) => {
    try {
      if (!username) throw new Error('Username is required');

      const room = `user-${username}`;
      socket.join(room);
      userRooms.add(room);
      currentUser = { id: userId || username, type: 'user' };

      console.log(`👤 User joined: ${username} in room ${room}`);

      // Create/update chat document
      await Chat.findOneAndUpdate(
        { username },
        {
          $setOnInsert: {
            username,
            userId,
            status: 'pending',
            lastActivity: new Date(),
          },
        },
        { upsert: true, new: true }
      );

      // Notify admin panel
      io.to('admin-room').emit('new-chat', {
        username,
        userId,
        room,
        timestamp: new Date(),
      });
    } catch (error) {
      handleError(socket, 'user-join-error', error);
    }
  });

  // Message handling
  // socket.on('send-message', async (msgData) => {
  //   try {
  //     console.log('📩 Message received:', msgData);
  //     const { room, sender, content, username, isAdmin, adminId, adminName } =
  //       msgData;

  //     // Validate message
  //     if (!content || !room || !sender) {
  //       throw new Error('Invalid message format');
  //     }

  //     // Prepare message document
  //     const messageDoc = {
  //       sender,
  //       content,
  //       isAdmin: Boolean(isAdmin),
  //       timestamp: new Date(),
  //       status: 'delivered',
  //       ...(isAdmin && {
  //         adminId,
  //         adminName,
  //         readBy: [], // Initialize empty readBy for admin messages
  //       }),
  //     };

  //     // Update chat in database
  //     const chat = await Chat.findOneAndUpdate(
  //       { username },
  //       {
  //         $push: { messages: messageDoc },
  //         $set: {
  //           lastActivity: new Date(),
  //           ...(isAdmin && {
  //             status: 'replied',
  //             lastAdminReply: new Date(),
  //           }),
  //           ...(!isAdmin && { status: 'pending' }),
  //         },
  //         $inc: { unreadCount: isAdmin ? 0 : 1 },
  //       },
  //       { new: true }
  //     );

  //     // Prepare real-time payload
  //     const messagePayload = {
  //       ...messageDoc,
  //       chatId: chat._id,
  //       username,
  //       room,
  //     };

  //     // Deliver to recipient(s)
  //     if (isAdmin) {
  //       // Admin message to user
  //       io.to(room).emit('new-message', messagePayload);

  //       // Notify admin panel of reply
  //       io.to('admin-room').emit('admin-message-sent', {
  //         ...messagePayload,
  //         chatStatus: 'replied',
  //       });
  //     } else {
  //       // User message to admin
  //       io.to('admin-room').emit('new-user-message', messagePayload);

  //       // Also send to user (for their own UI update)
  //       io.to(room).emit('message-delivered', {
  //         ...messagePayload,
  //         status: 'delivered',
  //       });
  //     }

  //     console.log(`✉️ ${isAdmin ? 'Admin' : 'User'} message sent to ${room}`);
  //   } catch (error) {
  //     handleError(socket, 'message-send-error', error);
  //   }
  // });
  socket.on('send-chat-message', async (data) => {
    try {
      console.log('📩 Message received:', data);
      const {
        message,
        sender,
        isAdmin,
        isGeneral,
        username,
        trackingNumber,
        room,
        timestamp,
      } = data;

      let query = isGeneral ? { username } : { trackingNumber };

      let chat = await Chat.findOne(query);

      // If no chat found, create new one
      if (!chat) {
        chat = new Chat({
          ...query,
          messages: [],
          customerName: sender,
        });
      }

      // Add new message
      chat.messages.push({
        sender,
        message,
        isAdmin,
        timestamp: timestamp || new Date(),
      });

      await chat.save();

      // Now safe to access chat._id
      io.to(room).emit('new-chat-message', {
        ...data,
        _id: chat._id,
      });
    } catch (error) {
      console.error('Message send error:', error);
      socket.emit('message-send-error', { error: error.message });
    }
  });

  // Message read receipts
  socket.on('mark-read', async ({ messageId, chatId, userId }) => {
    try {
      const update = {
        $push: {
          'messages.$[elem].readBy': {
            userId,
            timestamp: new Date(),
          },
        },
        $set: {
          'messages.$[elem].status': 'read',
          $inc: { unreadCount: -1 },
        },
      };

      const options = {
        arrayFilters: [{ 'elem._id': messageId }],
        new: true,
      };

      await Chat.findByIdAndUpdate(chatId, update, options);

      // Notify other clients
      io.to(`user-${username}`).emit('message-read', {
        messageId,
        readBy: userId,
        timestamp: new Date(),
      });
    } catch (error) {
      handleError(socket, 'read-receipt-error', error);
    }
  });

  // Disconnection handler
  socket.on('disconnect', () => {
    console.log(`❎ ${userType} disconnected: ${socket.id}`);
    userRooms.forEach((room) => {
      socket.leave(room);

      // Notify admin if it was a user disconnecting
      if (room.startsWith('user-') && userType === 'user') {
        io.to('admin-room').emit('user-disconnected', {
          username: room.replace('user-', ''),
          userId: currentUser?.id,
          timestamp: new Date(),
        });
      }
    });

    userRooms.clear();
  });

  // Error handling middleware
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
};

module.exports = handleSocketConnection;
