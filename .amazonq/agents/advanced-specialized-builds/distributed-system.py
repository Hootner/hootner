#!/usr/bin/env python3
import socket
import threading
import json
import time

class Node:
    def __init__(self, node_id, port):
        self.node_id = node_id
        self.port = port
        self.peers = []
        self.data = {}
        self.running = False
    
    def add_peer(self, host, port):
        self.peers.append((host, port))
    
    def start(self):
        self.running = True
        server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        server.bind(('localhost', self.port))
        server.listen(5)
        
        print(f"Node {self.node_id} listening on port {self.port}")
        
        while self.running:
            try:
                server.settimeout(1)
                client, addr = server.accept()
                threading.Thread(target=self.handle_client, args=(client,)).start()
            except socket.timeout:
                continue
    
    def handle_client(self, client):
        try:
            data = client.recv(1024).decode()
            message = json.loads(data)
            
            if message['type'] == 'set':
                self.data[message['key']] = message['value']
                response = {'status': 'ok'}
            elif message['type'] == 'get':
                response = {'value': self.data.get(message['key'])}
            else:
                response = {'status': 'unknown'}
            
            client.send(json.dumps(response).encode())
        finally:
            client.close()
    
    def send_to_peer(self, peer, message):
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.connect(peer)
            sock.send(json.dumps(message).encode())
            response = sock.recv(1024).decode()
            sock.close()
            return json.loads(response)
        except:
            return None
    
    def replicate(self, key, value):
        for peer in self.peers:
            self.send_to_peer(peer, {'type': 'set', 'key': key, 'value': value})

# Test
if __name__ == '__main__':
    node = Node('node1', 5000)
    
    # Start in background
    threading.Thread(target=node.start, daemon=True).start()
    time.sleep(1)
    
    # Test operations
    node.data['test'] = 'value'
    print(f"Node data: {node.data}")
    
    print("Distributed node running (press Ctrl+C to stop)")
    try:
        time.sleep(5)
    except KeyboardInterrupt:
        node.running = False
