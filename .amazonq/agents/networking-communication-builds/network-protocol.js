// Minimal Network Protocol - Custom packet format
class Protocol {
  encode(type, data) {
    const header = Buffer.alloc(4);
    header.writeUInt16BE(type, 0);
    header.writeUInt16BE(data.length, 2);
    return Buffer.concat([header, Buffer.from(data)]);
  }

  decode(packet) {
    const type = packet.readUInt16BE(0);
    const len = packet.readUInt16BE(2);
    const data = packet.slice(4, 4 + len).toString();
    return { type, data };
  }
}

const proto = new Protocol();
const packet = proto.encode(1, 'Hello');
console.log('Encoded:', packet);
console.log('Decoded:', proto.decode(packet));

export default Protocol;
