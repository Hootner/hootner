#!/usr/bin/env node
/**
 * Layer 9: Game Engine - Core game engine architecture
 * Dependencies: Layer 4 (Runtime), Layer 8 (Event System, Rendering)
 */

class GameEngine {
  constructor() {
    this.running = false;
    this.scenes = new Map();
    this.currentScene = null;
    this.fps = 60;
    this.deltaTime = 0;
    this.lastTime = 0;
    this.frameCount = 0;
  }

  // Create scene
  createScene(name) {
    const scene = {
      name,
      entities: [],
      systems: [],
      active: false
    };
    this.scenes.set(name, scene);
    console.log(`[SCENE] Created ${name}`);
    return scene;
  }

  // Load scene
  loadScene(name) {
    this.currentScene = this.scenes.get(name);
    if (this.currentScene) {
      this.currentScene.active = true;
      console.log(`[SCENE] Loaded ${name}`);
    }
  }

  // Add entity
  addEntity(entity) {
    if (this.currentScene) {
      this.currentScene.entities.push(entity);
      console.log(`[ENTITY] Added ${entity.name || 'unnamed'}`);
    }
  }

  // Game loop
  start() {
    this.running = true;
    this.lastTime = Date.now();
    console.log('[ENGINE] Started');
    this.loop();
  }

  // Main loop
  loop() {
    if (!this.running) return;
    
    const now = Date.now();
    this.deltaTime = (now - this.lastTime) / 1000;
    this.lastTime = now;
    
    // Update
    this.update(this.deltaTime);
    
    // Render
    this.render();
    
    this.frameCount++;
    
    // Next frame
    setTimeout(() => this.loop(), 1000 / this.fps);
  }

  // Update phase
  update(dt) {
    if (!this.currentScene) return;
    
    // Update systems
    for (const system of this.currentScene.systems) {
      system.update(dt);
    }
    
    // Update entities
    for (const entity of this.currentScene.entities) {
      if (entity.update) entity.update(dt);
    }
  }

  // Render phase
  render() {
    if (!this.currentScene) return;
    
    // Render entities
    for (const entity of this.currentScene.entities) {
      if (entity.render) entity.render();
    }
  }

  // Stop engine
  stop() {
    this.running = false;
    console.log('[ENGINE] Stopped');
  }

  // Get stats
  stats() {
    return {
      running: this.running,
      fps: (1 / this.deltaTime).toFixed(1),
      frames: this.frameCount,
      entities: this.currentScene?.entities.length || 0
    };
  }
}

// Entity class
class Entity {
  constructor(name) {
    this.name = name;
    this.position = { x: 0, y: 0, z: 0 };
    this.rotation = { x: 0, y: 0, z: 0 };
    this.scale = { x: 1, y: 1, z: 1 };
    this.components = [];
  }

  addComponent(component) {
    this.components.push(component);
    component.entity = this;
  }

  update(dt) {
    for (const component of this.components) {
      if (component.update) component.update(dt);
    }
  }

  render() {
    for (const component of this.components) {
      if (component.render) component.render();
    }
  }
}

// Transform component
class Transform {
  constructor(x = 0, y = 0, z = 0) {
    this.position = { x, y, z };
    this.rotation = { x: 0, y: 0, z: 0 };
    this.scale = { x: 1, y: 1, z: 1 };
  }

  translate(x, y, z) {
    this.position.x += x;
    this.position.y += y;
    this.position.z += z;
  }

  rotate(x, y, z) {
    this.rotation.x += x;
    this.rotation.y += y;
    this.rotation.z += z;
  }
}

// Sprite component
class Sprite {
  constructor(texture) {
    this.texture = texture;
    this.visible = true;
  }

  render() {
    if (this.visible) {
      console.log(`  [RENDER] Sprite ${this.texture}`);
    }
  }
}

// Input system
class InputSystem {
  constructor() {
    this.keys = new Set();
    this.mouse = { x: 0, y: 0, buttons: new Set() };
  }

  keyDown(key) {
    this.keys.add(key);
  }

  keyUp(key) {
    this.keys.delete(key);
  }

  isKeyPressed(key) {
    return this.keys.has(key);
  }

  mouseMove(x, y) {
    this.mouse.x = x;
    this.mouse.y = y;
  }

  mouseDown(button) {
    this.mouse.buttons.add(button);
  }

  mouseUp(button) {
    this.mouse.buttons.delete(button);
  }

  update(dt) {
    // Process input
  }
}

// Demo
if (require.main === module) {
  const engine = new GameEngine();
  
  console.log('=== Game Engine Demo ===\n');
  
  // Create scene
  const mainScene = engine.createScene('main');
  engine.loadScene('main');
  
  console.log();
  
  // Create entities
  const player = new Entity('player');
  player.addComponent(new Transform(0, 0, 0));
  player.addComponent(new Sprite('player.png'));
  player.update = function(dt) {
    this.position.x += 10 * dt;
  };
  
  engine.addEntity(player);
  
  const enemy = new Entity('enemy');
  enemy.addComponent(new Transform(100, 0, 0));
  enemy.addComponent(new Sprite('enemy.png'));
  
  engine.addEntity(enemy);
  
  // Add input system
  const input = new InputSystem();
  mainScene.systems.push(input);
  
  console.log();
  
  // Start engine
  engine.start();
  
  // Run for a bit
  setTimeout(() => {
    console.log('\nStats:', engine.stats());
    engine.stop();
  }, 200);
}

module.exports = { GameEngine, Entity, Transform, Sprite, InputSystem };
