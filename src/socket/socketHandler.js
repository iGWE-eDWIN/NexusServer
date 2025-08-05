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
      currentUser = { id: userId || username, username, type: 'user' };

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

      // Notify admin panel about new user connection
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

  // Handle user messages
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
      const newMessage = {
        sender,
        message,
        isAdmin,
        timestamp: timestamp || new Date(),
      };

      chat.messages.push(newMessage);
      chat.lastActivity = new Date();
      await chat.save();

      // Emit to appropriate rooms
      if (isAdmin) {
        // Admin message - send to specific user room
        const userRoom = `user-${username}`;
        io.to(userRoom).emit('admin-message', {
          ...newMessage,
          _id: chat._id,
        });
      } else {
        // User message - send to admin room
        io.to('admin-room').emit('user-message', {
          ...newMessage,
          username,
          _id: chat._id,
        });
      }

      // Also send back to sender's room for confirmation
      io.to(room).emit('new-chat-message', {
        ...data,
        _id: chat._id,
      });
    } catch (error) {
      console.error('Message send error:', error);
      socket.emit('message-send-error', { error: error.message });
    }
  });

  // Handle admin replies
  socket.on('admin-reply', async (data) => {
    try {
      const { username, message, adminName, adminId, timestamp } = data;

      // Find or create chat
      let chat = await Chat.findOne({ username });
      if (!chat) {
        chat = new Chat({
          username,
          messages: [],
          customerName: username,
        });
      }

      // Add admin message
      const adminMessage = {
        sender: adminName || 'Admin',
        message,
        isAdmin: true,
        adminId,
        timestamp: timestamp || new Date(),
      };

      chat.messages.push(adminMessage);
      chat.lastActivity = new Date();
      await chat.save();

      // Send to user's room
      const userRoom = `user-${username}`;
      io.to(userRoom).emit('admin-message', {
        ...adminMessage,
        _id: chat._id,
      });

      // Confirm to admin
      socket.emit('message-sent-confirmation', {
        username,
        message: adminMessage,
      });

      console.log(`📤 Admin reply sent to ${username}`);
    } catch (error) {
      console.error('Admin reply error:', error);
      socket.emit('admin-reply-error', { error: error.message });
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
        },
      };

      const options = {
        arrayFilters: [{ 'elem._id': messageId }],
        new: true,
      };

      await Chat.findByIdAndUpdate(chatId, update, options);

      // Notify other clients
      io.to(`user-${currentUser?.username}`).emit('message-read', {
        messageId,
        readBy: userId,
        timestamp: new Date(),
      });
    } catch (error) {
      handleError(socket, 'read-receipt-error', error);
    }
  });

  // Room management
  socket.on('join-room', (room) => {
    socket.join(room);
    userRooms.add(room);
    console.log(`📥 ${userType} joined room: ${room}`);
  });

  socket.on('leave-room', (room) => {
    socket.leave(room);
    userRooms.delete(room);
    console.log(`📤 ${userType} left room: ${room}`);
  });

  // Disconnection handler
  socket.on('disconnect', () => {
    console.log(`❎ ${userType} disconnected: ${socket.id}`);

    userRooms.forEach((room) => {
      socket.leave(room);

      // Notify admin if it was a user disconnecting
      if (room.startsWith('user-') && userType === 'user') {
        io.to('admin-room').emit('user-disconnected', {
          username: currentUser?.username || room.replace('user-', ''),
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
