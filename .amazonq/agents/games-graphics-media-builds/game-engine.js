class GameEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.entities = [];
        this.running = false;
        this.lastTime = 0;
    }
    
    addEntity(entity) {
        this.entities.push(entity);
    }
    
    start() {
        this.running = true;
        this.lastTime = performance.now();
        this.loop();
    }
    
    loop() {
        if (!this.running) return;
        
        const now = performance.now();
        const dt = (now - this.lastTime) / 1000;
        this.lastTime = now;
        
        this.update(dt);
        this.render();
        
        requestAnimationFrame(() => this.loop());
    }
    
    update(dt) {
        this.entities.forEach(entity => entity.update(dt));
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.entities.forEach(entity => entity.render(this.ctx));
    }
}

class Entity {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
    }
    
    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
    }
    
    render(ctx) {
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.x, this.y, 50, 50);
    }
}

// Usage (in browser):
// const canvas = document.getElementById('game');
// const engine = new GameEngine(canvas);
// const player = new Entity(100, 100);
// player.vx = 50;
// engine.addEntity(player);
// engine.start();

console.log('Game engine loaded');
