const http = require('http');

let items = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' }
];

const server = http.createServer((req, res) => {
    const { method, url } = req;
    
    res.setHeader('Content-Type', 'application/json');
    
    if (url === '/items' && method === 'GET') {
        res.writeHead(200);
        res.end(JSON.stringify(items));
    } else if (url.startsWith('/items/') && method === 'GET') {
        const id = parseInt(url.split('/')[2]);
        const item = items.find(i => i.id === id);
        if (item) {
            res.writeHead(200);
            res.end(JSON.stringify(item));
        } else {
            res.writeHead(404);
            res.end(JSON.stringify({ error: 'Not found' }));
        }
    } else if (url === '/items' && method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const newItem = JSON.parse(body);
            newItem.id = items.length + 1;
            items.push(newItem);
            res.writeHead(201);
            res.end(JSON.stringify(newItem));
        });
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not found' }));
    }
});

const PORT = 4000;
server.listen(PORT, () => {
    console.log(`REST API running on http://localhost:${PORT}`);
});
