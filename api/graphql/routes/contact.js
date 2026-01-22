import express from 'express';
import Contact from '../models/Contact.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    const contact = new Contact({ name, email, subject, message });
    await contact.save();
    
    // TODO: Send email notification to support team
    console.log(`📧 New contact message from ${email}`);
    
    res.json({ success: true, message: 'Message received' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 }).limit(50);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
