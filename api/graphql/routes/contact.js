
import xss from 'xss';

const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return xss(input);
  }
  return input;
};
import express from 'express';

// CSRF protection middleware
const csrfCheck = (req, res, next) => {
  const token = req.headers['x-csrf-token'] || req.body._token;
  if (!token || token !== req.session?.csrfToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  next();
};
import { createContact, listContacts } from '../models/Contact.js';

const router = express.Router();

router.post('/', csrfCheck, async (req, res) => {
  try {
    const { name: sanitizeInput(name), email: sanitizeInput(email), subject: sanitizeInput(subject), message: sanitizeInput(message) } = req.body;

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
