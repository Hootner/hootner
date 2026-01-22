import express from 'express';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';

const router = express.Router();

// Get user conversations
router.get('/conversations/:userId', async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.params.userId
    }).populate('participants', 'name email').sort({ updatedAt: -1 });
    
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get messages for a conversation
router.get('/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;
    
    const messages = await Message.find({ conversationId: req.params.conversationId })
      .populate('senderId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send message
router.post('/send', async (req, res) => {
  try {
    const { conversationId, senderId, text, type = 'text' } = req.body;
    
    const message = new Message({
      conversationId,
      senderId,
      text,
      type
    });
    
    await message.save();
    await message.populate('senderId', 'name email');
    
    // Update conversation last message
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: text,
      updatedAt: new Date()
    });
    
    // Emit to Socket.IO (when implemented)
    // req.app.get('io').to(conversationId).emit('message', message);
    
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create conversation
router.post('/conversations', async (req, res) => {
  try {
    const { participants, type = 'direct' } = req.body;
    
    // Check if conversation already exists for direct messages
    if (type === 'direct' && participants.length === 2) {
      const existing = await Conversation.findOne({
        type: 'direct',
        participants: { $all: participants, $size: 2 }
      });
      
      if (existing) {
        return res.json(existing);
      }
    }
    
    const conversation = new Conversation({
      participants,
      type
    });
    
    await conversation.save();
    await conversation.populate('participants', 'name email');
    
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;