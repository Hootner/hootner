#!/usr/bin/env python3
import socket

def tcp_server(host='127.0.0.1', port=8080):
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind((host, port))
    server.listen(5)
    print(f"TCP Server listening on {host}:{port}")
    
    while True:
        client, addr = server.accept()
        print(f"Connection from {addr}")
        
        data = client.recv(1024)
        if data:
            print(f"Received: {data.decode()}")
            client.send(b"Echo: " + data)
        
        client.close()

if __name__ == '__main__':
    tcp_server()
