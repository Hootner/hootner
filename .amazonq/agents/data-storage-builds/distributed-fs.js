// Minimal Distributed File System
class DistributedFS {
  constructor(nodes) {
    this.nodes = nodes;
    this.files = new Map();
  }

  write(filename, data, replicas = 2) {
    const chunks = this.chunk(data, 1024);
    const locations = [];
    
    chunks.forEach((chunk, i) => {
      const nodeIds = this.selectNodes(replicas);
      nodeIds.forEach(nodeId => {
        this.nodes[nodeId].store(`${filename}.${i}`, chunk);
      });
      locations.push({ chunk: i, nodes: nodeIds });
    });
    
    this.files.set(filename, locations);
  }

  chunk(data, size) {
    const chunks = [];
    for (let i = 0; i < data.length; i += size) {
      chunks.push(data.slice(i, i + size));
    }
    return chunks;
  }

  selectNodes(count) {
    return Array.from({ length: count }, () => 
      Math.floor(Math.random() * this.nodes.length)
    );
  }
}

export default DistributedFS;
