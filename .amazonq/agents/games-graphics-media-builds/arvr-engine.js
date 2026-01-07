// Minimal AR/VR Engine
class ARVREngine {
  constructor() {
    this.objects = [];
    this.camera = { x: 0, y: 0, z: 0, pitch: 0, yaw: 0 };
  }

  addObject(obj) {
    this.objects.push(obj);
  }

  setCamera(x, y, z, pitch, yaw) {
    Object.assign(this.camera, { x, y, z, pitch, yaw });
  }

  render() {
    return this.objects.map(obj => {
      const dx = obj.x - this.camera.x;
      const dy = obj.y - this.camera.y;
      const dz = obj.z - this.camera.z;
      const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
      return { ...obj, distance: dist };
    }).sort((a, b) => b.distance - a.distance);
  }
}

const engine = new ARVREngine();
engine.addObject({ x: 1, y: 0, z: 0, type: 'cube' });
engine.setCamera(0, 0, 0, 0, 0);
console.log(engine.render());

export default ARVREngine;
