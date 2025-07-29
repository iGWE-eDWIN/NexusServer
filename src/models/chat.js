const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  message: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
});

const chatSchema = new mongoose.Schema(
  {
    trackingNumber: { type: String, index: true },
    username: { type: String, index: true }, // For general users
    customerName: String,
    customerEmail: String,
    messages: [messageSchema],
    status: {
      type: String,
      enum: ['open', 'closed', 'pending'],
      default: 'open',
    },
    lastActivity: { type: Date, default: Date.now },
    assignedAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

chatSchema.pre('save', function (next) {
  if (this.isModified('messages')) {
    this.lastActivity = new Date();
  }
  next();
});

const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;
