import mongoose, { Schema } from 'mongoose';

const chatMessageSchema = new Schema(
  {
    roomId: { type: String, required: true },
    sender: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

export { ChatMessage };
