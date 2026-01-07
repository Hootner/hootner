#!/usr/bin/env node
/**
 * Layer 5: GraphQL Server - Query language for APIs
 * Dependencies: Layer 2 (Parser, AST), Layer 4 (Runtime), Layer 5 (HTTP)
 */

class GraphQLServer {
  constructor(schema, resolvers) {
    this.schema = schema;
    this.resolvers = resolvers;
    this.queries = [];
  }

  // Parse GraphQL query
  parseQuery(query) {
    const lines = query.trim().split('\n').map(l => l.trim());
    const operation = lines[0].match(/^(query|mutation)\s+(\w+)?/);
    
    const fields = [];
    for (let i = 1; i < lines.length; i++) {
      const match = lines[i].match(/(\w+)(\([^)]*\))?/);
      if (match) {
        const [, name, args] = match;
        fields.push({ name, args: args || '' });
      }
    }
    
    return {
      type: operation ? operation[1] : 'query',
      name: operation ? operation[2] : null,
      fields
    };
  }

  // Resolve field
  async resolveField(field, args, context) {
    const resolver = this.resolvers[field];
    if (!resolver) throw new Error(`No resolver for ${field}`);
    
    return await resolver(args, context);
  }

  // Execute query
  async execute(query, variables = {}, context = {}) {
    console.log(`[QUERY]\n${query}\n`);
    
    const parsed = this.parseQuery(query);
    const result = {};
    
    try {
      for (const field of parsed.fields) {
        const args = this.parseArgs(field.args, variables);
        result[field.name] = await this.resolveField(field.name, args, context);
      }
      
      this.queries.push({
        query,
        result,
        success: true,
        time: Date.now()
      });
      
      console.log('[RESULT]', JSON.stringify(result, null, 2));
      return { data: result };
    } catch (error) {
      this.queries.push({
        query,
        error: error.message,
        success: false,
        time: Date.now()
      });
      
      console.log('[ERROR]', error.message);
      return { errors: [{ message: error.message }] };
    }
  }

  // Parse arguments
  parseArgs(argsStr, variables) {
    if (!argsStr) return {};
    
    const args = {};
    const matches = argsStr.matchAll(/(\w+):\s*([^,)]+)/g);
    for (const [, key, value] of matches) {
      args[key] = value.startsWith('$') ? variables[value.slice(1)] : JSON.parse(value);
    }
    return args;
  }

  // Get statistics
  stats() {
    const successful = this.queries.filter(q => q.success).length;
    return {
      queries: this.queries.length,
      successful,
      failed: this.queries.length - successful
    };
  }
}

// Demo
if (require.main === module) {
  // Mock data
  const users = [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' }
  ];
  
  const posts = [
    { id: 1, title: 'Hello World', authorId: 1 },
    { id: 2, title: 'GraphQL Basics', authorId: 2 }
  ];
  
  // Resolvers
  const resolvers = {
    user: (args) => users.find(u => u.id === args.id),
    users: () => users,
    post: (args) => posts.find(p => p.id === args.id),
    posts: () => posts,
    createUser: (args) => {
      const user = { id: users.length + 1, ...args };
      users.push(user);
      return user;
    }
  };
  
  const server = new GraphQLServer({}, resolvers);
  
  console.log('=== GraphQL Server Demo ===\n');
  
  (async () => {
    // Query single user
    await server.execute(`
      query GetUser {
        user(id: 1)
      }
    `);
    
    console.log();
    
    // Query all users
    await server.execute(`
      query GetUsers {
        users
      }
    `);
    
    console.log();
    
    // Mutation
    await server.execute(`
      mutation CreateUser {
        createUser(name: "Charlie", email: "charlie@example.com")
      }
    `);
    
    console.log('\nStats:', server.stats());
  })();
}

module.exports = GraphQLServer;
