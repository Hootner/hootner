// Minimal Voxel Engine
class VoxelEngine {
  constructor(size) {
    this.size = size;
    this.voxels = new Map();
  }

  set(x, y, z, type) {
    this.voxels.set(`${x},${y},${z}`, type);
  }

  get(x, y, z) {
    return this.voxels.get(`${x},${y},${z}`) || 0;
  }

  render() {
    const lines = [];
    for (let y = this.size - 1; y >= 0; y--) {
      let line = '';
      for (let x = 0; x < this.size; x++) {
        const voxel = this.get(x, y, 0);
        line += voxel ? '#' : '.';
      }
      lines.push(line);
    }
    return lines.join('\n');
  }
}

const ve = new VoxelEngine(8);
ve.set(0, 0, 0, 1);
ve.set(1, 1, 0, 1);
ve.set(2, 2, 0, 1);
console.log(ve.render());

export default VoxelEngine;
