#!/usr/bin/env node
/**
 * Layer 9: Particle System - Visual effects with particles
 * Dependencies: Layer 9 (Physics Engine, Game Engine)
 */

class ParticleSystem {
  constructor() {
    this.emitters = [];
    this.particles = [];
    this.maxParticles = 10000;
  }

  // Create emitter
  createEmitter(x, y, config = {}) {
    const emitter = {
      position: { x, y },
      rate: config.rate || 10, // Particles per second
      lifetime: config.lifetime || 2.0,
      velocity: config.velocity || { x: 0, y: -50 },
      velocityVariance: config.velocityVariance || { x: 20, y: 20 },
      size: config.size || 5,
      sizeVariance: config.sizeVariance || 2,
      color: config.color || { r: 255, g: 255, b: 255, a: 1 },
      gravity: config.gravity || { x: 0, y: 50 },
      active: true,
      timeSinceEmit: 0
    };
    
    this.emitters.push(emitter);
    console.log(`[EMITTER] Created at (${x}, ${y})`);
    return emitter;
  }

  // Emit particle
  emit(emitter) {
    if (this.particles.length >= this.maxParticles) return;
    
    const particle = {
      position: { ...emitter.position },
      velocity: {
        x: emitter.velocity.x + (Math.random() - 0.5) * emitter.velocityVariance.x,
        y: emitter.velocity.y + (Math.random() - 0.5) * emitter.velocityVariance.y
      },
      size: emitter.size + (Math.random() - 0.5) * emitter.sizeVariance,
      color: { ...emitter.color },
      lifetime: emitter.lifetime,
      age: 0,
      alive: true
    };
    
    this.particles.push(particle);
  }

  // Update particles
  update(dt) {
    // Emit from active emitters
    for (const emitter of this.emitters) {
      if (!emitter.active) continue;
      
      emitter.timeSinceEmit += dt;
      const emitInterval = 1.0 / emitter.rate;
      
      while (emitter.timeSinceEmit >= emitInterval) {
        this.emit(emitter);
        emitter.timeSinceEmit -= emitInterval;
      }
    }
    
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      
      // Age
      p.age += dt;
      if (p.age >= p.lifetime) {
        this.particles.splice(i, 1);
        continue;
      }
      
      // Apply forces
      for (const emitter of this.emitters) {
        p.velocity.x += emitter.gravity.x * dt;
        p.velocity.y += emitter.gravity.y * dt;
      }
      
      // Update position
      p.position.x += p.velocity.x * dt;
      p.position.y += p.velocity.y * dt;
      
      // Fade out
      const lifeRatio = p.age / p.lifetime;
      p.color.a = 1.0 - lifeRatio;
      p.size *= 0.99; // Shrink
    }
  }

  // Render particles
  render() {
    const commands = [];
    
    for (const p of this.particles) {
      commands.push({
        type: 'circle',
        x: p.position.x,
        y: p.position.y,
        radius: p.size,
        color: `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.color.a})`
      });
    }
    
    return commands;
  }

  // Burst effect
  burst(x, y, count, config = {}) {
    const emitter = this.createEmitter(x, y, {
      ...config,
      rate: count / 0.1 // Emit all in 0.1 seconds
    });
    
    setTimeout(() => {
      emitter.active = false;
    }, 100);
    
    console.log(`[BURST] ${count} particles at (${x}, ${y})`);
  }

  // Preset: Fire
  static presetFire(x, y) {
    return {
      rate: 50,
      lifetime: 1.5,
      velocity: { x: 0, y: -80 },
      velocityVariance: { x: 30, y: 20 },
      size: 8,
      sizeVariance: 3,
      color: { r: 255, g: 100, b: 0, a: 1 },
      gravity: { x: 0, y: -20 }
    };
  }

  // Preset: Smoke
  static presetSmoke(x, y) {
    return {
      rate: 20,
      lifetime: 3.0,
      velocity: { x: 0, y: -30 },
      velocityVariance: { x: 20, y: 10 },
      size: 15,
      sizeVariance: 5,
      color: { r: 128, g: 128, b: 128, a: 0.5 },
      gravity: { x: 0, y: -10 }
    };
  }

  // Preset: Explosion
  static presetExplosion(x, y) {
    return {
      rate: 200,
      lifetime: 1.0,
      velocity: { x: 0, y: 0 },
      velocityVariance: { x: 100, y: 100 },
      size: 6,
      sizeVariance: 3,
      color: { r: 255, g: 200, b: 0, a: 1 },
      gravity: { x: 0, y: 100 }
    };
  }

  // Get stats
  stats() {
    return {
      emitters: this.emitters.filter(e => e.active).length,
      particles: this.particles.length,
      maxParticles: this.maxParticles
    };
  }
}

// Demo
if (require.main === module) {
  const particles = new ParticleSystem();
  
  console.log('=== Particle System Demo ===\n');
  
  // Create fire emitter
  const fire = particles.createEmitter(100, 200, ParticleSystem.presetFire(100, 200));
  
  // Create smoke emitter
  const smoke = particles.createEmitter(100, 150, ParticleSystem.presetSmoke(100, 150));
  
  console.log();
  
  // Simulate
  console.log('Simulating particles...\n');
  
  for (let i = 0; i < 5; i++) {
    particles.update(0.1);
    console.log(`Frame ${i + 1}: ${particles.particles.length} particles`);
  }
  
  console.log();
  
  // Burst
  particles.burst(200, 200, 50, ParticleSystem.presetExplosion(200, 200));
  particles.update(0.1);
  
  console.log('\nStats:', particles.stats());
}

module.exports = ParticleSystem;
