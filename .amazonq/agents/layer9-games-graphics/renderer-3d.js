#!/usr/bin/env node
/**
 * Layer 9: 3D Renderer - 3D graphics rendering pipeline
 * Dependencies: Layer 0 (Binary), Layer 8 (Rendering Engine)
 */

class Renderer3D {
  constructor(width = 800, height = 600) {
    this.width = width;
    this.height = height;
    this.camera = { position: { x: 0, y: 0, z: -5 }, rotation: { x: 0, y: 0, z: 0 } };
    this.meshes = [];
  }

  // Create mesh
  createMesh(vertices, faces) {
    const mesh = {
      vertices,
      faces,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    };
    this.meshes.push(mesh);
    console.log(`[MESH] Created with ${vertices.length} vertices, ${faces.length} faces`);
    return mesh;
  }

  // Matrix multiplication
  multiplyMatrix(a, b) {
    const result = Array(4).fill(0).map(() => Array(4).fill(0));
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        for (let k = 0; k < 4; k++) {
          result[i][j] += a[i][k] * b[k][j];
        }
      }
    }
    return result;
  }

  // Translation matrix
  translationMatrix(x, y, z) {
    return [
      [1, 0, 0, x],
      [0, 1, 0, y],
      [0, 0, 1, z],
      [0, 0, 0, 1]
    ];
  }

  // Rotation matrix (Y-axis)
  rotationMatrixY(angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return [
      [c, 0, s, 0],
      [0, 1, 0, 0],
      [-s, 0, c, 0],
      [0, 0, 0, 1]
    ];
  }

  // Scale matrix
  scaleMatrix(x, y, z) {
    return [
      [x, 0, 0, 0],
      [0, y, 0, 0],
      [0, 0, z, 0],
      [0, 0, 0, 1]
    ];
  }

  // Projection matrix (perspective)
  projectionMatrix(fov, aspect, near, far) {
    const f = 1 / Math.tan(fov / 2);
    return [
      [f / aspect, 0, 0, 0],
      [0, f, 0, 0],
      [0, 0, (far + near) / (near - far), (2 * far * near) / (near - far)],
      [0, 0, -1, 0]
    ];
  }

  // Transform vertex
  transformVertex(vertex, matrix) {
    const v = [vertex.x, vertex.y, vertex.z, 1];
    const result = [0, 0, 0, 0];
    
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        result[i] += matrix[i][j] * v[j];
      }
    }
    
    return {
      x: result[0] / result[3],
      y: result[1] / result[3],
      z: result[2] / result[3]
    };
  }

  // Project to screen
  projectToScreen(vertex) {
    return {
      x: (vertex.x + 1) * this.width / 2,
      y: (1 - vertex.y) * this.height / 2,
      z: vertex.z
    };
  }

  // Render mesh
  renderMesh(mesh) {
    const commands = [];
    
    // Build transformation matrix
    const translation = this.translationMatrix(mesh.position.x, mesh.position.y, mesh.position.z);
    const rotation = this.rotationMatrixY(mesh.rotation.y);
    const scale = this.scaleMatrix(mesh.scale.x, mesh.scale.y, mesh.scale.z);
    const projection = this.projectionMatrix(Math.PI / 4, this.width / this.height, 0.1, 100);
    
    let transform = this.multiplyMatrix(scale, rotation);
    transform = this.multiplyMatrix(transform, translation);
    transform = this.multiplyMatrix(transform, projection);
    
    // Transform vertices
    const transformedVertices = mesh.vertices.map(v => {
      const transformed = this.transformVertex(v, transform);
      return this.projectToScreen(transformed);
    });
    
    // Rasterize faces
    for (const face of mesh.faces) {
      const v0 = transformedVertices[face[0]];
      const v1 = transformedVertices[face[1]];
      const v2 = transformedVertices[face[2]];
      
      commands.push({
        type: 'triangle',
        vertices: [v0, v1, v2]
      });
    }
    
    return commands;
  }

  // Render all
  render() {
    console.log('[RENDER] Starting render');
    const commands = [];
    
    for (const mesh of this.meshes) {
      commands.push(...this.renderMesh(mesh));
    }
    
    console.log(`[RENDER] Generated ${commands.length} draw commands`);
    return commands;
  }

  // Create cube
  static createCube() {
    const vertices = [
      { x: -1, y: -1, z: -1 }, { x: 1, y: -1, z: -1 },
      { x: 1, y: 1, z: -1 }, { x: -1, y: 1, z: -1 },
      { x: -1, y: -1, z: 1 }, { x: 1, y: -1, z: 1 },
      { x: 1, y: 1, z: 1 }, { x: -1, y: 1, z: 1 }
    ];
    
    const faces = [
      [0, 1, 2], [0, 2, 3], // Front
      [4, 5, 6], [4, 6, 7], // Back
      [0, 4, 7], [0, 7, 3], // Left
      [1, 5, 6], [1, 6, 2], // Right
      [3, 2, 6], [3, 6, 7], // Top
      [0, 1, 5], [0, 5, 4]  // Bottom
    ];
    
    return { vertices, faces };
  }
}

// Demo
if (require.main === module) {
  const renderer = new Renderer3D(800, 600);
  
  console.log('=== 3D Renderer Demo ===\n');
  
  // Create cube
  const cube = Renderer3D.createCube();
  const mesh = renderer.createMesh(cube.vertices, cube.faces);
  
  // Position and rotate
  mesh.position.z = 5;
  mesh.rotation.y = Math.PI / 4;
  
  console.log();
  
  // Render
  const commands = renderer.render();
  
  console.log('\nFirst triangle:', commands[0]);
}

module.exports = Renderer3D;
