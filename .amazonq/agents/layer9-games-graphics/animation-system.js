#!/usr/bin/env node
/**
 * Layer 9: Animation System - Keyframe animation and tweening
 * Dependencies: Layer 4 (Runtime), Layer 9 (Game Engine)
 */

class AnimationSystem {
  constructor() {
    this.animations = [];
    this.time = 0;
  }

  // Create animation
  create(target, property, keyframes, duration, options = {}) {
    const animation = {
      target,
      property,
      keyframes, // [{ time: 0, value: 0 }, { time: 1, value: 100 }]
      duration,
      easing: options.easing || 'linear',
      loop: options.loop || false,
      yoyo: options.yoyo || false,
      delay: options.delay || 0,
      startTime: null,
      playing: false,
      completed: false
    };
    
    this.animations.push(animation);
    console.log(`[ANIMATION] Created for ${property}`);
    return animation;
  }

  // Easing functions
  easing = {
    linear: (t) => t,
    easeInQuad: (t) => t * t,
    easeOutQuad: (t) => t * (2 - t),
    easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeInCubic: (t) => t * t * t,
    easeOutCubic: (t) => (--t) * t * t + 1,
    easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    easeInElastic: (t) => {
      const c4 = (2 * Math.PI) / 3;
      return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
    },
    easeOutBounce: (t) => {
      const n1 = 7.5625;
      const d1 = 2.75;
      if (t < 1 / d1) return n1 * t * t;
      else if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
      else if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
      else return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  };

  // Interpolate between keyframes
  interpolate(keyframes, time, easingFn) {
    // Find surrounding keyframes
    let prev = keyframes[0];
    let next = keyframes[keyframes.length - 1];
    
    for (let i = 0; i < keyframes.length - 1; i++) {
      if (time >= keyframes[i].time && time <= keyframes[i + 1].time) {
        prev = keyframes[i];
        next = keyframes[i + 1];
        break;
      }
    }
    
    // Calculate progress between keyframes
    const duration = next.time - prev.time;
    const elapsed = time - prev.time;
    const t = duration > 0 ? elapsed / duration : 1;
    
    // Apply easing
    const easedT = easingFn(t);
    
    // Interpolate value
    return prev.value + (next.value - prev.value) * easedT;
  }

  // Play animation
  play(animation) {
    animation.playing = true;
    animation.startTime = this.time + animation.delay;
    console.log(`[PLAY] Animation started`);
  }

  // Pause animation
  pause(animation) {
    animation.playing = false;
    console.log(`[PAUSE] Animation paused`);
  }

  // Stop animation
  stop(animation) {
    animation.playing = false;
    animation.completed = true;
    console.log(`[STOP] Animation stopped`);
  }

  // Update animations
  update(dt) {
    this.time += dt;
    
    for (const anim of this.animations) {
      if (!anim.playing || anim.completed) continue;
      
      // Check delay
      if (this.time < anim.startTime) continue;
      
      // Calculate progress
      const elapsed = this.time - anim.startTime;
      let progress = elapsed / anim.duration;
      
      // Handle looping
      if (progress >= 1) {
        if (anim.loop) {
          anim.startTime = this.time;
          progress = 0;
        } else {
          progress = 1;
          anim.completed = true;
        }
      }
      
      // Handle yoyo
      if (anim.yoyo && Math.floor(elapsed / anim.duration) % 2 === 1) {
        progress = 1 - (progress % 1);
      }
      
      // Get easing function
      const easingFn = this.easing[anim.easing] || this.easing.linear;
      
      // Interpolate value
      const value = this.interpolate(anim.keyframes, progress, easingFn);
      
      // Apply to target
      if (typeof anim.property === 'string') {
        anim.target[anim.property] = value;
      } else {
        anim.property(value);
      }
    }
  }

  // Tween helper
  tween(target, property, from, to, duration, easing = 'linear') {
    const keyframes = [
      { time: 0, value: from },
      { time: 1, value: to }
    ];
    
    const anim = this.create(target, property, keyframes, duration, { easing });
    this.play(anim);
    return anim;
  }

  // Get stats
  stats() {
    return {
      animations: this.animations.length,
      playing: this.animations.filter(a => a.playing).length,
      completed: this.animations.filter(a => a.completed).length
    };
  }
}

// Demo
if (require.main === module) {
  const animator = new AnimationSystem();
  
  console.log('=== Animation System Demo ===\n');
  
  // Create object to animate
  const obj = { x: 0, y: 0, rotation: 0 };
  
  // Create animations
  const moveX = animator.create(obj, 'x', [
    { time: 0, value: 0 },
    { time: 0.5, value: 50 },
    { time: 1, value: 100 }
  ], 2.0, { easing: 'easeInOutQuad' });
  
  const moveY = animator.create(obj, 'y', [
    { time: 0, value: 0 },
    { time: 1, value: 50 }
  ], 2.0, { easing: 'easeOutBounce', delay: 0.5 });
  
  const rotate = animator.create(obj, 'rotation', [
    { time: 0, value: 0 },
    { time: 1, value: 360 }
  ], 1.0, { easing: 'linear', loop: true });
  
  console.log();
  
  // Play animations
  animator.play(moveX);
  animator.play(moveY);
  animator.play(rotate);
  
  console.log('\nSimulating...\n');
  
  // Simulate
  for (let i = 0; i < 10; i++) {
    animator.update(0.2);
    console.log(`Frame ${i + 1}: x=${obj.x.toFixed(1)}, y=${obj.y.toFixed(1)}, rotation=${obj.rotation.toFixed(1)}`);
  }
  
  console.log('\nStats:', animator.stats());
}

module.exports = AnimationSystem;
