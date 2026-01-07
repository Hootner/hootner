class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    
    add(v) {
        return new Vector2(this.x + v.x, this.y + v.y);
    }
    
    scale(s) {
        return new Vector2(this.x * s, this.y * s);
    }
    
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
}

class RigidBody {
    constructor(x, y, mass = 1) {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2(0, 0);
        this.acceleration = new Vector2(0, 0);
        this.mass = mass;
        this.radius = 20;
    }
    
    applyForce(force) {
        const f = force.scale(1 / this.mass);
        this.acceleration = this.acceleration.add(f);
    }
    
    update(dt) {
        this.velocity = this.velocity.add(this.acceleration.scale(dt));
        this.position = this.position.add(this.velocity.scale(dt));
        this.acceleration = new Vector2(0, 0);
    }
}

class PhysicsEngine {
    constructor() {
        this.bodies = [];
        this.gravity = new Vector2(0, 9.8);
    }
    
    addBody(body) {
        this.bodies.push(body);
    }
    
    update(dt) {
        this.bodies.forEach(body => {
            body.applyForce(this.gravity.scale(body.mass));
            body.update(dt);
            
            // Ground collision
            if (body.position.y > 400) {
                body.position.y = 400;
                body.velocity.y *= -0.8;
            }
        });
        
        this.checkCollisions();
    }
    
    checkCollisions() {
        for (let i = 0; i < this.bodies.length; i++) {
            for (let j = i + 1; j < this.bodies.length; j++) {
                const a = this.bodies[i];
                const b = this.bodies[j];
                const dx = b.position.x - a.position.x;
                const dy = b.position.y - a.position.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < a.radius + b.radius) {
                    console.log('Collision detected!');
                }
            }
        }
    }
}

// Test
const physics = new PhysicsEngine();
const body = new RigidBody(100, 0, 1);
physics.addBody(body);

for (let i = 0; i < 10; i++) {
    physics.update(0.016);
    console.log(`Frame ${i}: y=${body.position.y.toFixed(2)}`);
}
