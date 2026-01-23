import express from 'express';
import { createContact, listContacts } from '../models/Contact.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    const contact = await createContact({ name, email, subject, message });
    
    // TODO: Send email notification to support team
    console.log(`📧 New contact message from ${email}`);
    
    res.json({ success: true, message: 'Message received', contact });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const messages = await listContacts(50);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
