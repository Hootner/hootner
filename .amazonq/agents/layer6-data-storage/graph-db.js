#!/usr/bin/env node
/**
 * Layer 6: Graph Database - Neo4j-like graph store
 * Dependencies: Layer 0 (Logic), Layer 2 (Parser), Layer 3 (Memory)
 */

class GraphDB {
  constructor() {
    this.nodes = new Map();
    this.edges = [];
    this.nextNodeId = 1;
    this.nextEdgeId = 1;
  }

  // Create node
  createNode(labels, properties = {}) {
    const node = {
      id: this.nextNodeId++,
      labels: Array.isArray(labels) ? labels : [labels],
      properties,
      created: Date.now()
    };
    
    this.nodes.set(node.id, node);
    console.log(`[NODE] Created (${labels}) id=${node.id}`);
    return node.id;
  }

  // Create edge (relationship)
  createEdge(fromId, toId, type, properties = {}) {
    const edge = {
      id: this.nextEdgeId++,
      from: fromId,
      to: toId,
      type,
      properties,
      created: Date.now()
    };
    
    this.edges.push(edge);
    console.log(`[EDGE] ${fromId} -[${type}]-> ${toId}`);
    return edge.id;
  }

  // Find nodes
  findNodes(label, properties = {}) {
    const results = [];
    
    for (const node of this.nodes.values()) {
      if (node.labels.includes(label)) {
        let match = true;
        for (const [key, value] of Object.entries(properties)) {
          if (node.properties[key] !== value) {
            match = false;
            break;
          }
        }
        if (match) results.push(node);
      }
    }
    
    console.log(`[FIND] Found ${results.length} nodes with label ${label}`);
    return results;
  }

  // Get node by ID
  getNode(id) {
    return this.nodes.get(id);
  }

  // Get neighbors
  getNeighbors(nodeId, direction = 'out') {
    const neighbors = [];
    
    for (const edge of this.edges) {
      if (direction === 'out' && edge.from === nodeId) {
        neighbors.push({ node: this.nodes.get(edge.to), edge });
      } else if (direction === 'in' && edge.to === nodeId) {
        neighbors.push({ node: this.nodes.get(edge.from), edge });
      } else if (direction === 'both') {
        if (edge.from === nodeId) {
          neighbors.push({ node: this.nodes.get(edge.to), edge });
        } else if (edge.to === nodeId) {
          neighbors.push({ node: this.nodes.get(edge.from), edge });
        }
      }
    }
    
    return neighbors;
  }

  // Traverse (BFS)
  traverse(startId, maxDepth = 3) {
    const visited = new Set();
    const queue = [{ id: startId, depth: 0 }];
    const result = [];
    
    while (queue.length > 0) {
      const { id, depth } = queue.shift();
      
      if (visited.has(id) || depth > maxDepth) continue;
      visited.add(id);
      
      const node = this.nodes.get(id);
      result.push({ node, depth });
      
      const neighbors = this.getNeighbors(id, 'out');
      for (const { node: neighbor } of neighbors) {
        if (!visited.has(neighbor.id)) {
          queue.push({ id: neighbor.id, depth: depth + 1 });
        }
      }
    }
    
    console.log(`[TRAVERSE] Visited ${result.length} nodes from ${startId}`);
    return result;
  }

  // Shortest path (BFS)
  shortestPath(fromId, toId) {
    const queue = [{ id: fromId, path: [fromId] }];
    const visited = new Set();
    
    while (queue.length > 0) {
      const { id, path } = queue.shift();
      
      if (id === toId) {
        console.log(`[PATH] Found path of length ${path.length - 1}`);
        return path;
      }
      
      if (visited.has(id)) continue;
      visited.add(id);
      
      const neighbors = this.getNeighbors(id, 'out');
      for (const { node } of neighbors) {
        if (!visited.has(node.id)) {
          queue.push({ id: node.id, path: [...path, node.id] });
        }
      }
    }
    
    console.log('[PATH] No path found');
    return null;
  }

  // Cypher-like query (simplified)
  query(pattern) {
    // MATCH (a:Person)-[:KNOWS]->(b:Person) WHERE a.name = 'Alice'
    const match = pattern.match(/MATCH \((\w+):(\w+)\)-\[:(\w+)\]->\((\w+):(\w+)\) WHERE (\w+)\.(\w+) = '(.*)'/);
    
    if (match) {
      const [, aVar, aLabel, edgeType, bVar, bLabel, whereVar, whereProp, whereVal] = match;
      const results = [];
      
      const startNodes = this.findNodes(aLabel, { [whereProp]: whereVal });
      
      for (const startNode of startNodes) {
        const neighbors = this.getNeighbors(startNode.id, 'out');
        for (const { node, edge } of neighbors) {
          if (node.labels.includes(bLabel) && edge.type === edgeType) {
            results.push({ [aVar]: startNode, [bVar]: node, edge });
          }
        }
      }
      
      console.log(`[QUERY] Matched ${results.length} patterns`);
      return results;
    }
    
    return [];
  }

  // Stats
  stats() {
    return {
      nodes: this.nodes.size,
      edges: this.edges.length,
      labels: new Set(Array.from(this.nodes.values()).flatMap(n => n.labels)).size
    };
  }
}

// Demo
if (require.main === module) {
  const db = new GraphDB();
  
  console.log('=== Graph Database Demo ===\n');
  
  // Create nodes
  const alice = db.createNode('Person', { name: 'Alice', age: 30 });
  const bob = db.createNode('Person', { name: 'Bob', age: 25 });
  const charlie = db.createNode('Person', { name: 'Charlie', age: 35 });
  const company = db.createNode('Company', { name: 'TechCorp' });
  
  console.log();
  
  // Create relationships
  db.createEdge(alice, bob, 'KNOWS', { since: 2020 });
  db.createEdge(bob, charlie, 'KNOWS', { since: 2021 });
  db.createEdge(alice, company, 'WORKS_AT', { role: 'Engineer' });
  db.createEdge(bob, company, 'WORKS_AT', { role: 'Designer' });
  
  console.log();
  
  // Find nodes
  const people = db.findNodes('Person');
  console.log('People:', people.map(p => p.properties.name));
  
  console.log();
  
  // Get neighbors
  const aliceKnows = db.getNeighbors(alice, 'out');
  console.log('Alice knows:', aliceKnows.map(n => n.node.properties.name));
  
  console.log();
  
  // Shortest path
  const path = db.shortestPath(alice, charlie);
  console.log('Path:', path);
  
  console.log();
  
  // Traverse
  const traversal = db.traverse(alice, 2);
  console.log('Traversal:', traversal.map(t => `${t.node.properties.name} (depth ${t.depth})`));
  
  console.log();
  
  // Query
  const results = db.query("MATCH (a:Person)-[:KNOWS]->(b:Person) WHERE a.name = 'Alice'");
  console.log('Query results:', results.length);
  
  console.log('\nStats:', db.stats());
}

module.exports = GraphDB;
