import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      default: 'New Chat',
    },
    model: {
      type: String,
      default: 'mistralai/mistral-7b-instruct',
    },
    messages: [messageSchema],
    userApiKey: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export const Chat = mongoose.model('Chat', chatSchema);
