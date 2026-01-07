#!/usr/bin/env node
/**
 * Layer 9: Physics Engine - 2D physics simulation
 * Dependencies: Layer 0 (Math), Layer 9 (Game Engine)
 */

class PhysicsEngine {
  constructor() {
    this.bodies = [];
    this.gravity = { x: 0, y: 9.8 };
    this.iterations = 10;
  }

  // Create rigid body
  createBody(x, y, width, height, mass = 1) {
    const body = {
      position: { x, y },
      velocity: { x: 0, y: 0 },
      acceleration: { x: 0, y: 0 },
      force: { x: 0, y: 0 },
      mass,
      width,
      height,
      restitution: 0.8, // Bounciness
      friction: 0.1,
      static: mass === 0
    };
    
    this.bodies.push(body);
    console.log(`[BODY] Created at (${x}, ${y})`);
    return body;
  }

  // Apply force
  applyForce(body, fx, fy) {
    body.force.x += fx;
    body.force.y += fy;
  }

  // Update physics
  update(dt) {
    // Apply forces
    for (const body of this.bodies) {
      if (body.static) continue;
      
      // Gravity
      body.force.y += body.mass * this.gravity.y;
      
      // Calculate acceleration (F = ma)
      body.acceleration.x = body.force.x / body.mass;
      body.acceleration.y = body.force.y / body.mass;
      
      // Update velocity
      body.velocity.x += body.acceleration.x * dt;
      body.velocity.y += body.acceleration.y * dt;
      
      // Apply friction
      body.velocity.x *= (1 - body.friction);
      body.velocity.y *= (1 - body.friction);
      
      // Update position
      body.position.x += body.velocity.x * dt;
      body.position.y += body.velocity.y * dt;
      
      // Reset forces
      body.force.x = 0;
      body.force.y = 0;
    }
    
    // Collision detection and resolution
    for (let i = 0; i < this.bodies.length; i++) {
      for (let j = i + 1; j < this.bodies.length; j++) {
        this.resolveCollision(this.bodies[i], this.bodies[j]);
      }
    }
  }

  // AABB collision detection
  checkCollision(a, b) {
    return (
      a.position.x < b.position.x + b.width &&
      a.position.x + a.width > b.position.x &&
      a.position.y < b.position.y + b.height &&
      a.position.y + a.height > b.position.y
    );
  }

  // Resolve collision
  resolveCollision(a, b) {
    if (!this.checkCollision(a, b)) return;
    
    console.log(`[COLLISION] Bodies collided`);
    
    // Calculate overlap
    const overlapX = Math.min(
      a.position.x + a.width - b.position.x,
      b.position.x + b.width - a.position.x
    );
    
    const overlapY = Math.min(
      a.position.y + a.height - b.position.y,
      b.position.y + b.height - a.position.y
    );
    
    // Separate bodies
    if (overlapX < overlapY) {
      // Horizontal separation
      const direction = a.position.x < b.position.x ? -1 : 1;
      if (!a.static) a.position.x += direction * overlapX / 2;
      if (!b.static) b.position.x -= direction * overlapX / 2;
      
      // Bounce
      const relativeVelocity = a.velocity.x - b.velocity.x;
      const restitution = Math.min(a.restitution, b.restitution);
      
      if (!a.static) a.velocity.x = -a.velocity.x * restitution;
      if (!b.static) b.velocity.x = -b.velocity.x * restitution;
    } else {
      // Vertical separation
      const direction = a.position.y < b.position.y ? -1 : 1;
      if (!a.static) a.position.y += direction * overlapY / 2;
      if (!b.static) b.position.y -= direction * overlapY / 2;
      
      // Bounce
      const restitution = Math.min(a.restitution, b.restitution);
      
      if (!a.static) a.velocity.y = -a.velocity.y * restitution;
      if (!b.static) b.velocity.y = -b.velocity.y * restitution;
    }
  }

  // Raycast
  raycast(origin, direction, maxDistance = 1000) {
    const hits = [];
    
    for (const body of this.bodies) {
      // Simplified ray-box intersection
      const t = this.rayBoxIntersect(origin, direction, body);
      if (t > 0 && t < maxDistance) {
        hits.push({ body, distance: t });
      }
    }
    
    hits.sort((a, b) => a.distance - b.distance);
    return hits[0] || null;
  }

  // Ray-box intersection
  rayBoxIntersect(origin, direction, box) {
    const tMin = (box.position.x - origin.x) / direction.x;
    const tMax = (box.position.x + box.width - origin.x) / direction.x;
    
    return Math.max(tMin, 0);
  }

  // Get stats
  stats() {
    return {
      bodies: this.bodies.length,
      gravity: this.gravity,
      kinetic: this.bodies.reduce((sum, b) => {
        const v = Math.sqrt(b.velocity.x ** 2 + b.velocity.y ** 2);
        return sum + 0.5 * b.mass * v ** 2;
      }, 0).toFixed(2)
    };
  }
}

// Demo
if (require.main === module) {
  const physics = new PhysicsEngine();
  
  console.log('=== Physics Engine Demo ===\n');
  
  // Create ground (static)
  const ground = physics.createBody(0, 500, 800, 100, 0);
  
  // Create falling box
  const box = physics.createBody(100, 0, 50, 50, 1);
  
  // Create another box
  const box2 = physics.createBody(200, 100, 50, 50, 1);
  
  console.log();
  
  // Simulate
  console.log('Simulating physics...\n');
  
  for (let i = 0; i < 5; i++) {
    physics.update(0.016); // 60 FPS
    console.log(`Frame ${i + 1}: Box at y=${box.position.y.toFixed(2)}, velocity=${box.velocity.y.toFixed(2)}`);
  }
  
  console.log('\nStats:', physics.stats());
}

module.exports = PhysicsEngine;
