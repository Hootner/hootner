import express from 'express';
import { createMessage, listMessages } from '../models/Message.js';
import { createConversation, listConversations, getConversation, updateLastMessage } from '../models/Conversation.js';

const router = express.Router();

// Get user conversations
router.get('/conversations/:userId', async (req, res) => {
  try {
    const conversations = await listConversations(req.params.userId);
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get messages for a conversation
router.get('/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const messages = await listMessages(req.params.conversationId, parseInt(limit));
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send message
router.post('/send', async (req, res) => {
  try {
    const { conversationId, senderId, text, type = 'text' } = req.body;
    
    const message = await createMessage({
      conversationId,
      senderId,
      text,
      type
    });
    
    // Update conversation last message
    await updateLastMessage(conversationId, text);
    
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
    const { participants, type = 'direct', name } = req.body;
    
    // Check if conversation already exists for direct messages
    if (type === 'direct' && participants.length === 2) {
      const existing = await listConversations(participants[0]);
      const match = existing.find(c => 
        c.type === 'direct' && 
        c.participants.length === 2 && 
        c.participants.includes(participants[1])
      );
      
      if (match) {
        return res.json(match);
      }
    }
    
    const conversation = await createConversation({
      participants,
      type,
      name
    });
    
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;