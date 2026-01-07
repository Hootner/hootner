#!/usr/bin/env node
/**
 * Layer 5: Message Broker - Kafka-like message queue system
 * Dependencies: Layer 3 (Memory, Filesystem), Layer 4 (Process), Layer 5 (TCP)
 */

class MessageBroker {
  constructor() {
    this.topics = new Map();
    this.consumers = new Map();
    this.consumerGroups = new Map();
  }

  // Create topic
  createTopic(name, partitions = 3) {
    this.topics.set(name, {
      name,
      partitions: Array.from({ length: partitions }, (_, i) => ({
        id: i,
        messages: [],
        offset: 0
      }))
    });
    console.log(`[TOPIC] Created ${name} with ${partitions} partitions`);
  }

  // Publish message
  publish(topic, message, key = null) {
    const t = this.topics.get(topic);
    if (!t) throw new Error(`Topic ${topic} not found`);
    
    // Partition selection
    const partition = key 
      ? this.hashPartition(key, t.partitions.length)
      : Math.floor(Math.random() * t.partitions.length);
    
    const msg = {
      key,
      value: message,
      timestamp: Date.now(),
      offset: t.partitions[partition].messages.length
    };
    
    t.partitions[partition].messages.push(msg);
    console.log(`[PUBLISH] ${topic}[${partition}] offset=${msg.offset}: ${message}`);
    
    // Notify consumers
    this.notifyConsumers(topic, partition, msg);
    
    return { partition, offset: msg.offset };
  }

  // Hash partition
  hashPartition(key, numPartitions) {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = ((hash << 5) - hash) + key.charCodeAt(i);
    }
    return Math.abs(hash) % numPartitions;
  }

  // Subscribe consumer
  subscribe(consumerId, topic, group = null) {
    if (!this.consumers.has(consumerId)) {
      this.consumers.set(consumerId, {
        id: consumerId,
        topics: [],
        offsets: new Map(),
        group
      });
    }
    
    const consumer = this.consumers.get(consumerId);
    consumer.topics.push(topic);
    
    if (group) {
      if (!this.consumerGroups.has(group)) {
        this.consumerGroups.set(group, []);
      }
      this.consumerGroups.get(group).push(consumerId);
    }
    
    console.log(`[SUBSCRIBE] ${consumerId} -> ${topic}${group ? ` (group: ${group})` : ''}`);
  }

  // Consume messages
  consume(consumerId, topic, partition = 0, count = 10) {
    const consumer = this.consumers.get(consumerId);
    const t = this.topics.get(topic);
    
    const key = `${topic}:${partition}`;
    const offset = consumer.offsets.get(key) || 0;
    
    const messages = t.partitions[partition].messages.slice(offset, offset + count);
    
    if (messages.length > 0) {
      consumer.offsets.set(key, offset + messages.length);
      console.log(`[CONSUME] ${consumerId} read ${messages.length} messages from ${topic}[${partition}]`);
    }
    
    return messages;
  }

  // Notify consumers
  notifyConsumers(topic, partition, message) {
    for (const [id, consumer] of this.consumers) {
      if (consumer.topics.includes(topic)) {
        // Consumer would be notified here
      }
    }
  }

  // Get statistics
  stats() {
    const topicStats = Array.from(this.topics.entries()).map(([name, t]) => ({
      name,
      partitions: t.partitions.length,
      messages: t.partitions.reduce((sum, p) => sum + p.messages.length, 0)
    }));
    
    return {
      topics: topicStats,
      consumers: this.consumers.size,
      groups: this.consumerGroups.size
    };
  }
}

// Demo
if (require.main === module) {
  const broker = new MessageBroker();
  
  console.log('=== Message Broker Demo ===\n');
  
  // Create topics
  broker.createTopic('orders', 3);
  broker.createTopic('events', 2);
  
  // Subscribe consumers
  broker.subscribe('consumer-1', 'orders', 'group-a');
  broker.subscribe('consumer-2', 'orders', 'group-a');
  broker.subscribe('consumer-3', 'events');
  
  console.log();
  
  // Publish messages
  broker.publish('orders', 'Order #1001', 'user-123');
  broker.publish('orders', 'Order #1002', 'user-456');
  broker.publish('orders', 'Order #1003', 'user-123');
  broker.publish('events', 'User logged in');
  
  console.log();
  
  // Consume messages
  broker.consume('consumer-1', 'orders', 0);
  broker.consume('consumer-3', 'events', 0);
  
  console.log('\nStats:', broker.stats());
}

module.exports = MessageBroker;
