// Minimal Email Server - SMTP/IMAP basics
class EmailServer {
  constructor() {
    this.mailboxes = new Map();
    this.queue = [];
  }

  // Create mailbox
  createMailbox(email) {
    if (!this.mailboxes.has(email)) {
      this.mailboxes.set(email, { inbox: [], sent: [] });
      console.log(`Mailbox created: ${email}`);
    }
  }

  // Send email (SMTP)
  send(from, to, subject, body) {
    const email = {
      id: Date.now() + Math.random(),
      from,
      to,
      subject,
      body,
      timestamp: new Date().toISOString(),
      read: false
    };

    // Queue for delivery
    this.queue.push(email);
    this.deliver(email);

    return { success: true, id: email.id };
  }

  // Deliver email
  deliver(email) {
    const toMailbox = this.mailboxes.get(email.to);
    const fromMailbox = this.mailboxes.get(email.from);

    if (toMailbox) {
      toMailbox.inbox.push(email);
      console.log(`✓ Delivered to ${email.to}`);
    } else {
      console.log(`✗ Mailbox not found: ${email.to}`);
    }

    if (fromMailbox) {
      fromMailbox.sent.push(email);
    }
  }

  // Fetch inbox (IMAP)
  fetchInbox(email) {
    const mailbox = this.mailboxes.get(email);
    return mailbox ? mailbox.inbox : [];
  }

  // Read email
  read(email, emailId) {
    const mailbox = this.mailboxes.get(email);
    if (!mailbox) return null;

    const msg = mailbox.inbox.find(e => e.id === emailId);
    if (msg) {
      msg.read = true;
      return msg;
    }
    return null;
  }

  // Delete email
  delete(email, emailId) {
    const mailbox = this.mailboxes.get(email);
    if (!mailbox) return false;

    mailbox.inbox = mailbox.inbox.filter(e => e.id !== emailId);
    return true;
  }

  // Get unread count
  getUnreadCount(email) {
    const mailbox = this.mailboxes.get(email);
    if (!mailbox) return 0;
    return mailbox.inbox.filter(e => !e.read).length;
  }
}

// Demo
console.log('=== Email Server Demo ===\n');

const server = new EmailServer();

// Create mailboxes
server.createMailbox('alice@example.com');
server.createMailbox('bob@example.com');

// Send emails
console.log('\n--- Sending Emails ---');
server.send('alice@example.com', 'bob@example.com', 'Hello', 'Hi Bob!');
server.send('bob@example.com', 'alice@example.com', 'Re: Hello', 'Hi Alice!');
server.send('alice@example.com', 'bob@example.com', 'Meeting', 'Tomorrow at 3pm?');

// Check inbox
console.log('\n--- Bob\'s Inbox ---');
const bobInbox = server.fetchInbox('bob@example.com');
bobInbox.forEach(email => {
  console.log(`[${email.read ? 'READ' : 'UNREAD'}] From: ${email.from}`);
  console.log(`  Subject: ${email.subject}`);
});

// Read email
console.log('\n--- Reading Email ---');
const email = server.read('bob@example.com', bobInbox[0].id);
console.log(`Subject: ${email.subject}`);
console.log(`Body: ${email.body}`);

// Unread count
console.log(`\nUnread: ${server.getUnreadCount('bob@example.com')}`);

export default EmailServer;
