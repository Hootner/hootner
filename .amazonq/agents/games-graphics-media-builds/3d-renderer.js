// Minimal 3D Renderer
class Renderer3D {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.buffer = Array(height).fill(0).map(() => Array(width).fill(' '));
  }

  project(x, y, z) {
    const scale = 200 / (z + 5);
    return {
      x: Math.floor(this.width / 2 + x * scale),
      y: Math.floor(this.height / 2 - y * scale)
    };
  }

  drawPoint(x, y, z, char = '*') {
    const p = this.project(x, y, z);
    if (p.x >= 0 && p.x < this.width && p.y >= 0 && p.y < this.height) {
      this.buffer[p.y][p.x] = char;
    }
  }

  render() {
    return this.buffer.map(row => row.join('')).join('\n');
  }
}

const r = new Renderer3D(40, 20);
r.drawPoint(0, 0, 0);
r.drawPoint(1, 1, 1);
console.log(r.render());

export default Renderer3D;
