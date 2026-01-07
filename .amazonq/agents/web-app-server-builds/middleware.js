class MiddlewareApp {
    constructor() {
        this.middlewares = [];
    }
    
    use(fn) {
        this.middlewares.push(fn);
    }
    
    handle(req, res) {
        let index = 0;
        
        const next = () => {
            if (index >= this.middlewares.length) return;
            const middleware = this.middlewares[index++];
            middleware(req, res, next);
        };
        
        next();
    }
}

// Test
const app = new MiddlewareApp();

app.use((req, res, next) => {
    console.log('Logger:', req.url);
    next();
});

app.use((req, res, next) => {
    req.user = { id: 1, name: 'Alice' };
    next();
});

app.use((req, res, next) => {
    res.body = `Hello ${req.user.name}!`;
    next();
});

app.use((req, res, next) => {
    console.log('Response:', res.body);
});

// Simulate request
app.handle({ url: '/test' }, {});
