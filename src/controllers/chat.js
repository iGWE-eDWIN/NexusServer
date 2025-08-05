const Chat = require('../models/chat');
const { param } = require('../routers/chat');

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

const deleteChatMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const result = await Chat.findOneAndUpdate(
      { 'messages._id': messageId }, // Find the chat document containing the message
      { $pull: { messages: { _id: messageId } } }, // Remove that message from the array
      { new: true }
    );

    if (!result) {
      return res.status(404).send({ error: 'Message not found' });
    }

    res.send({ message: 'Message deleted successfully' });
  } catch (err) {
    console.error('Error deleting message:', err);
    res.status(500).send({ error: 'Failed to delete message' });
  }
};

module.exports = {
  getAllChats,
  getChat,
  deleteChatMessage,
};
