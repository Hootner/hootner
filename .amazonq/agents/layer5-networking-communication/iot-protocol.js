#!/usr/bin/env node
/**
 * Layer 5: IoT Protocol - MQTT/CoAP for IoT devices
 * Dependencies: Layer 0 (Binary), Layer 5 (TCP, Message Broker)
 */

class IoTProtocol {
  constructor(protocol = 'mqtt') {
    this.protocol = protocol;
    this.devices = new Map();
    this.topics = new Map();
    this.messages = [];
  }

  // Register device
  registerDevice(deviceId, metadata) {
    this.devices.set(deviceId, {
      id: deviceId,
      type: metadata.type,
      status: 'online',
      lastSeen: Date.now(),
      subscriptions: [],
      telemetry: []
    });
    console.log(`[DEVICE] Registered ${deviceId} (${metadata.type})`);
  }

  // MQTT: Subscribe to topic
  subscribe(deviceId, topic) {
    const device = this.devices.get(deviceId);
    if (!device) throw new Error('Device not found');
    
    device.subscriptions.push(topic);
    
    if (!this.topics.has(topic)) {
      this.topics.set(topic, []);
    }
    this.topics.get(topic).push(deviceId);
    
    console.log(`[SUBSCRIBE] ${deviceId} -> ${topic}`);
  }

  // MQTT: Publish message
  publish(deviceId, topic, payload, qos = 0) {
    console.log(`[PUBLISH] ${deviceId} -> ${topic} (QoS ${qos})`);
    console.log('Payload:', payload);
    
    const message = {
      from: deviceId,
      topic,
      payload,
      qos,
      timestamp: Date.now()
    };
    
    this.messages.push(message);
    
    // Deliver to subscribers
    if (this.topics.has(topic)) {
      for (const subscriberId of this.topics.get(topic)) {
        if (subscriberId !== deviceId) {
          this.deliver(subscriberId, message);
        }
      }
    }
  }

  // Deliver message to device
  deliver(deviceId, message) {
    const device = this.devices.get(deviceId);
    console.log(`[DELIVER] -> ${deviceId}: ${message.topic}`);
    device.lastSeen = Date.now();
  }

  // CoAP: GET request
  coap_get(deviceId, uri) {
    console.log(`[CoAP GET] ${deviceId} -> ${uri}`);
    
    // Simulate response
    const response = {
      code: '2.05', // Content
      payload: { temperature: 22.5, humidity: 45 }
    };
    
    this.messages.push({
      from: deviceId,
      method: 'GET',
      uri,
      response,
      timestamp: Date.now()
    });
    
    return response;
  }

  // CoAP: POST request
  coap_post(deviceId, uri, payload) {
    console.log(`[CoAP POST] ${deviceId} -> ${uri}`);
    console.log('Payload:', payload);
    
    const response = {
      code: '2.01', // Created
      payload: { status: 'ok' }
    };
    
    this.messages.push({
      from: deviceId,
      method: 'POST',
      uri,
      payload,
      response,
      timestamp: Date.now()
    });
    
    return response;
  }

  // Send telemetry
  sendTelemetry(deviceId, data) {
    const device = this.devices.get(deviceId);
    device.telemetry.push({
      data,
      timestamp: Date.now()
    });
    
    // Publish to telemetry topic
    this.publish(deviceId, `telemetry/${deviceId}`, data, 1);
  }

  // Device shadow (state management)
  updateShadow(deviceId, desired) {
    const device = this.devices.get(deviceId);
    device.shadow = {
      desired,
      reported: device.shadow?.reported || {},
      timestamp: Date.now()
    };
    console.log(`[SHADOW] Updated ${deviceId}:`, desired);
  }

  // Get statistics
  stats() {
    return {
      protocol: this.protocol,
      devices: this.devices.size,
      topics: this.topics.size,
      messages: this.messages.length,
      online: Array.from(this.devices.values()).filter(d => d.status === 'online').length
    };
  }
}

// Demo
if (require.main === module) {
  const iot = new IoTProtocol('mqtt');
  
  console.log('=== IoT Protocol Demo ===\n');
  
  // Register devices
  iot.registerDevice('sensor-001', { type: 'temperature' });
  iot.registerDevice('sensor-002', { type: 'humidity' });
  iot.registerDevice('gateway-001', { type: 'gateway' });
  
  console.log();
  
  // MQTT pub/sub
  iot.subscribe('gateway-001', 'sensors/#');
  iot.subscribe('gateway-001', 'alerts/#');
  
  console.log();
  
  iot.publish('sensor-001', 'sensors/temperature', { value: 22.5, unit: 'C' }, 1);
  iot.publish('sensor-002', 'sensors/humidity', { value: 45, unit: '%' }, 1);
  
  console.log();
  
  // Telemetry
  iot.sendTelemetry('sensor-001', { temp: 23.1, battery: 85 });
  
  console.log();
  
  // CoAP
  iot.coap_get('sensor-001', '/temperature');
  iot.coap_post('sensor-001', '/config', { interval: 60 });
  
  console.log('\nStats:', iot.stats());
}

module.exports = IoTProtocol;
