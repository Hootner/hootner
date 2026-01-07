#!/usr/bin/env python3
from http.server import SimpleHTTPRequestHandler, HTTPServer
import os

class StaticFileServer(SimpleHTTPRequestHandler):
    def __init__(self, *args, directory=None, **kwargs):
        if directory is None:
            directory = os.getcwd()
        self.directory = directory
        super().__init__(*args, **kwargs)
    
    def do_GET(self):
        if self.path == '/':
            self.path = '/index.html'
        return super().do_GET()
    
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

def run_server(port=8080, directory='.'):
    handler = lambda *args, **kwargs: StaticFileServer(*args, directory=directory, **kwargs)
    server = HTTPServer(('localhost', port), handler)
    print(f'Static file server running on http://localhost:{port}')
    print(f'Serving files from: {os.path.abspath(directory)}')
    server.serve_forever()

if __name__ == '__main__':
    run_server()
