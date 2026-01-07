// Minimal IoT Protocol (MQTT-like)
class IoTProtocol {
  constructor() {
    this.topics = new Map();
  }

  subscribe(topic, callback) {
    if (!this.topics.has(topic)) this.topics.set(topic, []);
    this.topics.get(topic).push(callback);
  }

  publish(topic, data) {
    if (!this.topics.has(topic)) return;
    this.topics.get(topic).forEach(cb => cb(data));
  }
}

const iot = new IoTProtocol();
iot.subscribe('sensors/temp', data => console.log('Temp:', data));
iot.publish('sensors/temp', 22.5);

export default IoTProtocol;
