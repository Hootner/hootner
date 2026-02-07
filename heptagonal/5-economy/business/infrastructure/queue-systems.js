/**
 * Queue Systems Service
 * RabbitMQ/Apache Kafka async processing
 */

class QueueSystems {
  constructor() {
    this.brokers = new Map();
    this.queues = new Map();
    this.topics = new Map();
    this.consumers = new Map();
    this.messages = new Map();
    
    this.initializeBrokers();
    this.initializeQueues();
  }

  initializeBrokers() {
    const brokers = [
      {
        name: 'rabbitmq_cluster',
        type: 'rabbitmq',
        nodes: ['rabbit-1.hootner.com', 'rabbit-2.hootner.com', 'rabbit-3.hootner.com'],
        port: 5672,
        managementPort: 15672,
        status: 'active'
      },
      {
        name: 'kafka_cluster',
        type: 'kafka',
        nodes: ['kafka-1.hootner.com', 'kafka-2.hootner.com', 'kafka-3.hootner.com'],
        port: 9092,
        zookeeperPort: 2181,
        status: 'active'
      }
    ];

    brokers.forEach(broker => {
      this.brokers.set(broker.name, {
        ...broker,
        createdAt: new Date().toISOString(),
        messageCount: Math.floor(Math.random() * 100000),
        throughput: Math.floor(Math.random() * 10000) + 1000,
        connections: Math.floor(Math.random() * 500) + 100
      });
    });
  }

  initializeQueues() {
    const queues = [
      { name: 'video-processing', broker: 'rabbitmq_cluster', type: 'work_queue', durable: true },
      { name: 'user-notifications', broker: 'rabbitmq_cluster', type: 'fanout', durable: true },
      { name: 'payment-events', broker: 'kafka_cluster', type: 'topic', partitions: 3 },
      { name: 'analytics-events', broker: 'kafka_cluster', type: 'topic', partitions: 6 },
      { name: 'content-moderation', broker: 'rabbitmq_cluster', type: 'work_queue', durable: true }
    ];

    queues.forEach(queue => {
      const queueData = {
        ...queue,
        createdAt: new Date().toISOString(),
        messageCount: Math.floor(Math.random() * 10000),
        consumers: Math.floor(Math.random() * 10) + 1,
        publishRate: Math.floor(Math.random() * 1000) + 100,
        consumeRate: Math.floor(Math.random() * 800) + 80,
        status: 'active'
      };

      if (queue.broker === 'kafka_cluster') {
        this.topics.set(queue.name, queueData);
      } else {
        this.queues.set(queue.name, queueData);
      }
    });
  }

  async publishMessage({ queue, message, priority = 'normal', delay = 0 }) {
    console.log(`📤 Publishing message to queue: ${queue}`);
    
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const messageData = {
      id: messageId,
      queue,
      message,
      priority,
      delay,
      publishedAt: new Date().toISOString(),
      status: 'published',
      attempts: 0,
      maxRetries: 3
    };

    // Determine broker type
    const queueData = this.queues.get(queue) || this.topics.get(queue);
    if (!queueData) {
      throw new Error(`Queue ${queue} not found`);
    }

    const broker = this.brokers.get(queueData.broker);
    
    try {
      if (broker.type === 'rabbitmq') {
        await this.publishToRabbitMQ(messageData, queueData, broker);
      } else if (broker.type === 'kafka') {
        await this.publishToKafka(messageData, queueData, broker);
      }
      
      messageData.status = 'queued';
      
      // Update queue stats
      queueData.messageCount++;
      queueData.publishRate++;
      
    } catch (error) {
      messageData.status = 'failed';
      messageData.error = error.message;
    }
    
    this.messages.set(messageId, messageData);
    
    return messageData;
  }

  async publishToRabbitMQ(message, queue, broker) {
    console.log(`  🐰 Publishing to RabbitMQ: ${queue.name}`);
    
    // Simulate RabbitMQ publish
    const publishTime = Math.random() * 50 + 10; // 10-60ms
    await new Promise(resolve => setTimeout(resolve, publishTime));
    
    // Simulate occasional failures
    if (Math.random() < 0.02) { // 2% failure rate
      throw new Error('RabbitMQ publish failed: Connection timeout');
    }
    
    return {
      broker: broker.name,
      exchange: queue.type === 'fanout' ? queue.name : 'direct',
      routingKey: queue.name,
      publishTime
    };
  }

  async publishToKafka(message, topic, broker) {
    console.log(`  📊 Publishing to Kafka: ${topic.name}`);
    
    // Calculate partition
    const partition = this.calculatePartition(message.message, topic.partitions);
    
    // Simulate Kafka publish
    const publishTime = Math.random() * 30 + 5; // 5-35ms
    await new Promise(resolve => setTimeout(resolve, publishTime));
    
    // Simulate occasional failures
    if (Math.random() < 0.01) { // 1% failure rate
      throw new Error('Kafka publish failed: Leader not available');
    }
    
    return {
      broker: broker.name,
      topic: topic.name,
      partition,
      offset: Math.floor(Math.random() * 1000000),
      publishTime
    };
  }

  calculatePartition(message, partitionCount) {
    // Simple hash-based partitioning
    let hash = 0;
    const messageStr = JSON.stringify(message);
    
    for (let i = 0; i < messageStr.length; i++) {
      hash = ((hash << 5) - hash + messageStr.charCodeAt(i)) & 0xffffffff;
    }
    
    return Math.abs(hash) % partitionCount;
  }

  async consumeMessage({ queue, consumerGroup = 'default', autoAck = true }) {
    console.log(`📥 Consuming message from queue: ${queue}`);
    
    const queueData = this.queues.get(queue) || this.topics.get(queue);
    if (!queueData) {
      throw new Error(`Queue ${queue} not found`);
    }

    const broker = this.brokers.get(queueData.broker);
    
    // Find a message to consume
    const availableMessages = Array.from(this.messages.values())
      .filter(msg => msg.queue === queue && msg.status === 'queued');
    
    if (availableMessages.length === 0) {
      return { queue, message: null, reason: 'No messages available' };
    }

    const message = availableMessages[0];
    
    const consumption = {
      messageId: message.id,
      queue,
      consumerGroup,
      consumedAt: new Date().toISOString(),
      processingTime: 0,
      status: 'processing'
    };

    try {
      if (broker.type === 'rabbitmq') {
        await this.consumeFromRabbitMQ(message, queueData, autoAck);
      } else if (broker.type === 'kafka') {
        await this.consumeFromKafka(message, queueData, consumerGroup);
      }
      
      consumption.status = 'completed';
      message.status = 'consumed';
      message.consumedAt = consumption.consumedAt;
      
      // Update queue stats
      queueData.messageCount = Math.max(0, queueData.messageCount - 1);
      queueData.consumeRate++;
      
    } catch (error) {
      consumption.status = 'failed';
      consumption.error = error.message;
      
      // Handle retry logic
      message.attempts++;
      if (message.attempts < message.maxRetries) {
        message.status = 'retry';
        message.nextRetry = new Date(Date.now() + Math.pow(2, message.attempts) * 1000).toISOString();
      } else {
        message.status = 'dead_letter';
      }
    }
    
    consumption.processingTime = Date.now() - new Date(consumption.consumedAt).getTime();
    
    return {
      consumption,
      message: message.message,
      metadata: {
        messageId: message.id,
        attempts: message.attempts,
        publishedAt: message.publishedAt
      }
    };
  }

  async consumeFromRabbitMQ(message, queue, autoAck) {
    console.log(`  🐰 Consuming from RabbitMQ: ${queue.name}`);
    
    // Simulate message processing
    const processingTime = Math.random() * 200 + 50; // 50-250ms
    await new Promise(resolve => setTimeout(resolve, Math.min(processingTime, 100)));
    
    // Simulate processing failures
    if (Math.random() < 0.05) { // 5% failure rate
      throw new Error('Message processing failed');
    }
    
    return { processed: true, autoAck, processingTime };
  }

  async consumeFromKafka(message, topic, consumerGroup) {
    console.log(`  📊 Consuming from Kafka: ${topic.name} (group: ${consumerGroup})`);
    
    // Simulate message processing
    const processingTime = Math.random() * 150 + 30; // 30-180ms
    await new Promise(resolve => setTimeout(resolve, Math.min(processingTime, 80)));
    
    // Simulate processing failures
    if (Math.random() < 0.03) { // 3% failure rate
      throw new Error('Kafka message processing failed');
    }
    
    return { processed: true, consumerGroup, processingTime };
  }

  async createQueue({ name, broker, type = 'work_queue', durable = true, partitions = 1 }) {
    console.log(`🏗️ Creating queue: ${name} on ${broker}`);
    
    const brokerData = this.brokers.get(broker);
    if (!brokerData) {
      throw new Error(`Broker ${broker} not found`);
    }

    const queueData = {
      name,
      broker,
      type,
      durable,
      partitions: brokerData.type === 'kafka' ? partitions : 1,
      createdAt: new Date().toISOString(),
      messageCount: 0,
      consumers: 0,
      publishRate: 0,
      consumeRate: 0,
      status: 'active'
    };

    if (brokerData.type === 'kafka') {
      this.topics.set(name, queueData);
    } else {
      this.queues.set(name, queueData);
    }
    
    return queueData;
  }

  async setup({ brokers = ['rabbitmq', 'kafka'], partitioning = 'topic-based', durability = 'persistent' }) {
    console.log(`⚙️ Setting up queue systems: ${brokers.join(', ')}`);
    
    const setup = {
      id: `queue_setup_${Date.now()}`,
      brokers,
      partitioning,
      durability,
      setupAt: new Date().toISOString(),
      status: 'active',
      configuration: {
        clustering: true,
        replication: durability === 'persistent',
        monitoring: true,
        deadLetterQueues: true,
        retryPolicy: {
          maxRetries: 3,
          backoffMultiplier: 2,
          initialDelay: 1000
        }
      }
    };
    
    return setup;
  }

  async getQueueMetrics(queue = null, timeRange = '24h') {
    const allQueues = new Map([...this.queues, ...this.topics]);
    const queues = queue ? [allQueues.get(queue)].filter(Boolean) : Array.from(allQueues.values());
    
    return {
      timeRange,
      generatedAt: new Date().toISOString(),
      summary: {
        totalQueues: queues.length,
        totalMessages: queues.reduce((sum, q) => sum + q.messageCount, 0),
        totalConsumers: queues.reduce((sum, q) => sum + q.consumers, 0),
        averagePublishRate: Math.round(queues.reduce((sum, q) => sum + q.publishRate, 0) / queues.length),
        averageConsumeRate: Math.round(queues.reduce((sum, q) => sum + q.consumeRate, 0) / queues.length)
      },
      queueMetrics: queues.map(queue => ({
        name: queue.name,
        broker: queue.broker,
        type: queue.type,
        messageCount: queue.messageCount,
        consumers: queue.consumers,
        publishRate: queue.publishRate,
        consumeRate: queue.consumeRate,
        lag: Math.max(0, queue.publishRate - queue.consumeRate),
        status: queue.status,
        partitions: queue.partitions || 1
      })),
      brokerMetrics: this.getBrokerMetrics(),
      performance: {
        throughput: this.calculateTotalThroughput(),
        latency: this.calculateAverageLatency(),
        errorRate: this.calculateErrorRate(),
        backlog: this.calculateBacklog(queues)
      }
    };
  }

  getBrokerMetrics() {
    return Array.from(this.brokers.values()).map(broker => ({
      name: broker.name,
      type: broker.type,
      nodes: broker.nodes.length,
      connections: broker.connections,
      throughput: broker.throughput,
      messageCount: broker.messageCount,
      status: broker.status
    }));
  }

  calculateTotalThroughput() {
    return Array.from(this.brokers.values()).reduce((sum, broker) => sum + broker.throughput, 0);
  }

  calculateAverageLatency() {
    const messages = Array.from(this.messages.values())
      .filter(msg => msg.consumedAt && msg.publishedAt);
    
    if (messages.length === 0) return 0;
    
    const totalLatency = messages.reduce((sum, msg) => {
      const latency = new Date(msg.consumedAt).getTime() - new Date(msg.publishedAt).getTime();
      return sum + latency;
    }, 0);
    
    return Math.round(totalLatency / messages.length);
  }

  calculateErrorRate() {
    const totalMessages = this.messages.size;
    if (totalMessages === 0) return 0;
    
    const failedMessages = Array.from(this.messages.values())
      .filter(msg => msg.status === 'failed' || msg.status === 'dead_letter').length;
    
    return Math.round((failedMessages / totalMessages) * 10000) / 100; // Percentage with 2 decimals
  }

  calculateBacklog(queues) {
    return queues.reduce((sum, queue) => {
      const lag = Math.max(0, queue.publishRate - queue.consumeRate);
      return sum + lag;
    }, 0);
  }

  async getMessageStatus(messageId) {
    return this.messages.get(messageId) || null;
  }

  async listQueues(broker = null) {
    const allQueues = new Map([...this.queues, ...this.topics]);
    const queues = Array.from(allQueues.values());
    
    if (broker) {
      return queues.filter(q => q.broker === broker);
    }
    
    return queues;
  }

  async getBrokerStatus(brokerName) {
    return this.brokers.get(brokerName) || null;
  }

  async purgeQueue({ queue, confirm = false }) {
    if (!confirm) {
      throw new Error('Queue purge requires confirmation');
    }
    
    console.log(`🧹 Purging queue: ${queue}`);
    
    const queueData = this.queues.get(queue) || this.topics.get(queue);
    if (!queueData) {
      throw new Error(`Queue ${queue} not found`);
    }

    // Remove all messages for this queue
    const messagesToRemove = Array.from(this.messages.entries())
      .filter(([, msg]) => msg.queue === queue);
    
    messagesToRemove.forEach(([messageId]) => {
      this.messages.delete(messageId);
    });
    
    // Reset queue stats
    queueData.messageCount = 0;
    
    return {
      queue,
      messagesRemoved: messagesToRemove.length,
      purgedAt: new Date().toISOString()
    };
  }

  async createConsumerGroup({ queue, groupId, consumers = 1 }) {
    console.log(`👥 Creating consumer group: ${groupId} for queue: ${queue}`);
    
    const consumerGroup = {
      id: groupId,
      queue,
      consumers,
      createdAt: new Date().toISOString(),
      status: 'active',
      consumedMessages: 0,
      lastActivity: new Date().toISOString()
    };

    this.consumers.set(groupId, consumerGroup);
    
    // Update queue consumer count
    const queueData = this.queues.get(queue) || this.topics.get(queue);
    if (queueData) {
      queueData.consumers += consumers;
    }
    
    return consumerGroup;
  }
}

module.exports = new QueueSystems();