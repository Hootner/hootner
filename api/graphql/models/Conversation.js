import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  type: { type: String, enum: ['direct', 'group'], default: 'direct' },
  name: String, // For group conversations
  lastMessage: String,
  lastMessageAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Conversation', conversationSchema);