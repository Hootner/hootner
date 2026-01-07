// Minimal Message Queue - Pub/Sub, Persistence, Dead Letter Queue
class MessageQueue {
  constructor() {
    this.queues = new Map();
    this.subscribers = new Map();
    this.dlq = []; // Dead letter queue
    this.maxRetries = 3;
  }

  // Create queue
  createQueue(name) {
    if (!this.queues.has(name)) {
      this.queues.set(name, []);
      this.subscribers.set(name, []);
    }
  }

  // Publish message
  publish(queueName, message) {
    if (!this.queues.has(queueName)) {
      this.createQueue(queueName);
    }

    const msg = {
      id: Date.now() + Math.random(),
      data: message,
      timestamp: Date.now(),
      retries: 0
    };

    this.queues.get(queueName).push(msg);
    console.log(`Published to ${queueName}: ${JSON.stringify(message)}`);

    // Notify subscribers
    this.notifySubscribers(queueName, msg);
    return msg.id;
  }

  // Subscribe to queue
  subscribe(queueName, handler) {
    if (!this.subscribers.has(queueName)) {
      this.createQueue(queueName);
    }

    const subscriber = { id: Date.now() + Math.random(), handler };
    this.subscribers.get(queueName).push(subscriber);
    console.log(`Subscribed to ${queueName}`);
    return subscriber.id;
  }

  // Notify subscribers
  notifySubscribers(queueName, message) {
    const subs = this.subscribers.get(queueName) || [];
    subs.forEach(sub => {
      try {
        sub.handler(message);
      } catch (error) {
        console.error(`Subscriber error: ${error.message}`);
        this.handleFailure(queueName, message);
      }
    });
  }

  // Handle message failure
  handleFailure(queueName, message) {
    message.retries++;
    if (message.retries >= this.maxRetries) {
      this.dlq.push({ ...message, queue: queueName, reason: 'max_retries' });
      console.log(`Moved to DLQ: ${message.id}`);
    } else {
      // Requeue
      setTimeout(() => {
        this.queues.get(queueName).push(message);
        console.log(`Requeued: ${message.id} (retry ${message.retries})`);
      }, 1000 * message.retries);
    }
  }

  // Consume message (pull model)
  consume(queueName) {
    const queue = this.queues.get(queueName);
    if (!queue || queue.length === 0) return null;
    
    const message = queue.shift();
    console.log(`Consumed from ${queueName}: ${JSON.stringify(message.data)}`);
    return message;
  }

  // Get queue size
  size(queueName) {
    return this.queues.get(queueName)?.length || 0;
  }

  // Get DLQ
  getDeadLetters() {
    return this.dlq;
  }
}

// Demo: Order Processing
console.log('=== Message Queue Demo ===\n');

const mq = new MessageQueue();

// Create queues
mq.createQueue('orders');
mq.createQueue('notifications');

// Subscribe to orders
mq.subscribe('orders', (msg) => {
  console.log(`Processing order: ${msg.data.orderId}`);
  if (msg.data.orderId === 'order-3') {
    throw new Error('Payment failed');
  }
});

// Subscribe to notifications
mq.subscribe('notifications', (msg) => {
  console.log(`Sending email: ${msg.data.email}`);
});

// Publish messages
console.log('Publishing orders:');
mq.publish('orders', { orderId: 'order-1', amount: 100 });
mq.publish('orders', { orderId: 'order-2', amount: 200 });
mq.publish('orders', { orderId: 'order-3', amount: 300 }); // Will fail

console.log('\nPublishing notifications:');
mq.publish('notifications', { email: 'user@example.com', subject: 'Order confirmed' });

// Check DLQ after retries
setTimeout(() => {
  console.log('\n=== Dead Letter Queue ===');
  console.log(mq.getDeadLetters());
}, 5000);

export default MessageQueue;
