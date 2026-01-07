const http = require('http');
const url = require('url');

class MVC {
    constructor() {
        this.routes = {};
        this.models = {};
    }
    
    model(name, data) {
        this.models[name] = data;
    }
    
    route(path, controller) {
        this.routes[path] = controller;
    }
    
    view(data) {
        return `<html><body><h1>${data.title}</h1><p>${data.content}</p></body></html>`;
    }
    
    start(port = 3000) {
        const server = http.createServer((req, res) => {
            const pathname = url.parse(req.url).pathname;
            const controller = this.routes[pathname];
            
            if (controller) {
                const data = controller(this.models);
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(this.view(data));
            } else {
                res.writeHead(404);
                res.end('Not Found');
            }
        });
        
        server.listen(port, () => {
            console.log(`MVC Server running on http://localhost:${port}`);
        });
    }
}

// Usage
const app = new MVC();

app.model('users', [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
]);

app.route('/', (models) => ({
    title: 'Home',
    content: `Users: ${models.users.map(u => u.name).join(', ')}`
}));

app.start();
