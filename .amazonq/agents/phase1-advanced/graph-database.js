// Minimal Graph Database - Nodes, Edges, Traversal
class GraphDB {
  constructor() {
    this.nodes = new Map();
    this.edges = new Map();
  }

  addNode(id, data = {}) {
    this.nodes.set(id, { id, data, edges: [] });
    return this.nodes.get(id);
  }

  addEdge(fromId, toId, label = '', properties = {}) {
    const edge = { from: fromId, to: toId, label, properties };
    const edgeId = `${fromId}->${toId}:${label}`;
    this.edges.set(edgeId, edge);
    
    const fromNode = this.nodes.get(fromId);
    if (fromNode) fromNode.edges.push(edgeId);
    return edge;
  }

  getNode(id) {
    return this.nodes.get(id);
  }

  getNeighbors(nodeId, label = null) {
    const node = this.nodes.get(nodeId);
    if (!node) return [];
    
    return node.edges
      .map(edgeId => this.edges.get(edgeId))
      .filter(edge => !label || edge.label === label)
      .map(edge => this.nodes.get(edge.to));
  }

  // BFS traversal
  traverse(startId, callback) {
    const visited = new Set();
    const queue = [startId];
    
    while (queue.length > 0) {
      const nodeId = queue.shift();
      if (visited.has(nodeId)) continue;
      
      visited.add(nodeId);
      const node = this.nodes.get(nodeId);
      if (node) {
        callback(node);
        this.getNeighbors(nodeId).forEach(n => queue.push(n.id));
      }
    }
  }

  // Find shortest path (BFS)
  shortestPath(startId, endId) {
    const visited = new Set();
    const queue = [[startId]];
    
    while (queue.length > 0) {
      const path = queue.shift();
      const nodeId = path[path.length - 1];
      
      if (nodeId === endId) return path;
      if (visited.has(nodeId)) continue;
      
      visited.add(nodeId);
      this.getNeighbors(nodeId).forEach(n => {
        queue.push([...path, n.id]);
      });
    }
    return null;
  }

  // Query by node properties
  query(predicate) {
    return Array.from(this.nodes.values()).filter(node => predicate(node.data));
  }
}

// Demo: Social Network
const db = new GraphDB();

// Add users
db.addNode('alice', { name: 'Alice', age: 30 });
db.addNode('bob', { name: 'Bob', age: 25 });
db.addNode('charlie', { name: 'Charlie', age: 35 });
db.addNode('diana', { name: 'Diana', age: 28 });

// Add relationships
db.addEdge('alice', 'bob', 'FOLLOWS');
db.addEdge('bob', 'charlie', 'FOLLOWS');
db.addEdge('alice', 'charlie', 'FOLLOWS');
db.addEdge('charlie', 'diana', 'FOLLOWS');
db.addEdge('alice', 'bob', 'FRIEND', { since: 2020 });

console.log('Alice follows:', db.getNeighbors('alice', 'FOLLOWS').map(n => n.data.name));
console.log('Shortest path Alice->Diana:', db.shortestPath('alice', 'diana'));
console.log('Users over 30:', db.query(data => data.age > 30).map(n => n.data.name));

export default GraphDB;
