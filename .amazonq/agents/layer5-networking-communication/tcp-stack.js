#!/usr/bin/env node
/**
 * Layer 5: TCP/IP Stack - Minimal TCP/IP implementation
 * Dependencies: Layer 0 (FSM), Layer 3 (Memory), Layer 4 (Process)
 */

class TCPStack {
  constructor() {
    this.connections = new Map();
    this.nextPort = 1024;
    this.packets = [];
  }

  // Create TCP connection
  connect(host, port) {
    const connId = `${host}:${port}`;
    const conn = {
      state: 'SYN_SENT',
      seq: Math.floor(Math.random() * 1000),
      ack: 0,
      buffer: []
    };
    this.connections.set(connId, conn);
    this.sendPacket(connId, 'SYN', conn.seq);
    return connId;
  }

  // Send packet
  sendPacket(connId, flags, seq, data = '') {
    const conn = this.connections.get(connId);
    this.packets.push({ connId, flags, seq, ack: conn.ack, data, time: Date.now() });
    console.log(`[SEND] ${connId} ${flags} seq=${seq} ack=${conn.ack}`);
  }

  // Receive packet (simulated)
  receivePacket(connId, flags, seq, ack, data = '') {
    const conn = this.connections.get(connId);
    console.log(`[RECV] ${connId} ${flags} seq=${seq} ack=${ack}`);

    // TCP state machine
    if (conn.state === 'SYN_SENT' && flags === 'SYN-ACK') {
      conn.state = 'ESTABLISHED';
      conn.ack = seq + 1;
      this.sendPacket(connId, 'ACK', conn.seq + 1);
    } else if (conn.state === 'ESTABLISHED' && flags === 'DATA') {
      conn.buffer.push(data);
      conn.ack = seq + data.length;
      this.sendPacket(connId, 'ACK', conn.seq);
    } else if (flags === 'FIN') {
      conn.state = 'CLOSE_WAIT';
      this.sendPacket(connId, 'FIN-ACK', conn.seq);
    }
  }

  // Send data
  send(connId, data) {
    const conn = this.connections.get(connId);
    if (conn.state !== 'ESTABLISHED') throw new Error('Not connected');
    this.sendPacket(connId, 'DATA', conn.seq, data);
    conn.seq += data.length;
  }

  // Close connection
  close(connId) {
    const conn = this.connections.get(connId);
    conn.state = 'FIN_WAIT';
    this.sendPacket(connId, 'FIN', conn.seq);
  }

  // Get statistics
  stats() {
    return {
      connections: this.connections.size,
      packets: this.packets.length,
      states: Array.from(this.connections.values()).map(c => c.state)
    };
  }
}

// Demo
if (require.main === module) {
  const stack = new TCPStack();
  
  console.log('=== TCP/IP Stack Demo ===\n');
  
  // Establish connection
  const conn = stack.connect('192.168.1.100', 80);
  stack.receivePacket(conn, 'SYN-ACK', 500, 1);
  
  // Send data
  stack.send(conn, 'GET / HTTP/1.1\r\n');
  stack.receivePacket(conn, 'DATA', 501, 18, 'HTTP/1.1 200 OK\r\n');
  
  // Close
  stack.close(conn);
  stack.receivePacket(conn, 'FIN-ACK', 518, 19);
  
  console.log('\nStats:', stack.stats());
}

module.exports = TCPStack;
