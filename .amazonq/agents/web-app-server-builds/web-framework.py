#!/usr/bin/env python3
from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import re

routes = {}

def route(path):
    def decorator(func):
        routes[path] = func
        return func
    return decorator

class WebFramework(BaseHTTPRequestHandler):
    def do_GET(self):
        for pattern, handler in routes.items():
            match = re.match(pattern, self.path)
            if match:
                response = handler(match.groups())
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(response).encode())
                return
        
        self.send_response(404)
        self.end_headers()

@route(r'^/$')
def index(args):
    return {'message': 'Hello Web Framework!'}

@route(r'^/user/(\w+)$')
def user(args):
    return {'user': args[0]}

if __name__ == '__main__':
    server = HTTPServer(('localhost', 8000), WebFramework)
    print('Server running on http://localhost:8000')
    server.serve_forever()
