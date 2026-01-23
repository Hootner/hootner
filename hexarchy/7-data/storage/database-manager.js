/**
 * HOOTNER Database Manager - DynamoDB + Redis
 */
const EventEmitter = require('events');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

class DatabaseManager extends EventEmitter {
  constructor() {
    super();
    this.connections = new Map();
    this.healthChecks = new Map();
    this.metrics = {
      totalConnections: 0,
      activeConnections: 0,
      totalQueries: 0,
      failedQueries: 0
    };
  }

  async connect(name, config) {
    console.log(`🔌 Connecting to ${name} (${config.type})`);
    
    try {
      const connection = await this.createConnection(config);
      this.connections.set(name, { connection, config, status: 'connected' });
      this.metrics.totalConnections++;
      this.metrics.activeConnections++;
      this.startHealthCheck(name);
      this.emit('connected', { name, type: config.type });
      console.log(`✅ ${name} connected`);
      return connection;
    } catch (error) {
      console.error(`❌ Failed to connect to ${name}:`, error.message);
      this.emit('error', { name, error });
      throw error;
    }
  }

  async createConnection(config) {
    switch (config.type) {
      case 'redis':
        return this.createRedisConnection(config);
      case 'dynamodb':
        return this.createDynamoConnection(config);
      default:
        throw new Error(`Unsupported database type: ${config.type}`);
    }
  }

  createDynamoConnection(config) {
    const clientConfig = {
      region: config.region || 'us-east-1',
      ...(config.endpoint && { endpoint: config.endpoint }),
      ...(config.credentials && { credentials: config.credentials })
    };

    const client = new DynamoDBClient(clientConfig);
    const docClient = DynamoDBDocumentClient.from(client, {
      marshallOptions: { removeUndefinedValues: true }
    });

    return {
      type: 'dynamodb',
      table: config.table || 'hootner-dev',
      client: docClient,
      async healthCheck() {
        await docClient.send(new ScanCommand({ TableName: config.table || 'hootner-dev', Limit: 1 }));
        return true;
      },
      async close() {}
    };
  }

  createRedisConnection(config) {
    const cache = new Map();
    
    return {
      type: 'redis',
      host: config.host || 'localhost',
      port: config.port || 6379,
      async get(key) {
        return cache.get(key) || null;
      },
      async set(key, value, ttl) {
        cache.set(key, value);
        if (ttl) setTimeout(() => cache.delete(key), ttl * 1000);
        return 'OK';
      },
      async del(key) {
        const existed = cache.has(key);
        cache.delete(key);
        return existed ? 1 : 0;
      },
      async close() {
        cache.clear();
      }
    };
  }

  getConnection(name) {
    const conn = this.connections.get(name);
    if (!conn) throw new Error(`Connection '${name}' not found`);
    if (conn.status !== 'connected') throw new Error(`Connection '${name}' not active`);
    return conn.connection;
  }

  startHealthCheck(name) {
    const interval = setInterval(async () => {
      await this.checkHealth(name);
    }, 30000);
    this.healthChecks.set(name, interval);
  }

  async checkHealth(name) {
    const conn = this.connections.get(name);
    if (!conn) return;
    
    try {
      const { connection, config } = conn;
      
      if (config.type === 'redis') {
        await connection.get('health_check');
      } else if (config.type === 'dynamodb' && connection.healthCheck) {
        await connection.healthCheck();
      }
      
      conn.lastHealthCheck = Date.now();
      if (conn.status !== 'connected') {
        conn.status = 'connected';
        this.emit('reconnected', { name });
      }
    } catch (error) {
      conn.status = 'disconnected';
      conn.lastError = error.message;
      this.emit('disconnected', { name, error });
    }
  }

  async closeAll() {
    console.log('🔌 Closing all connections...');
    
    for (const interval of this.healthChecks.values()) {
      clearInterval(interval);
    }
    this.healthChecks.clear();
    
    for (const [name, { connection }] of this.connections) {
      try {
        await connection.close();
        console.log(`✅ Closed ${name}`);
      } catch (error) {
        console.error(`❌ Error closing ${name}:`, error.message);
      }
    }
    
    this.connections.clear();
    this.metrics.activeConnections = 0;
  }

  healthCheck() {
    const connections = {};
    let allHealthy = true;
    
    for (const [name, conn] of this.connections) {
      const isHealthy = conn.status === 'connected';
      connections[name] = {
        status: conn.status,
        healthy: isHealthy,
        type: conn.config.type
      };
      if (!isHealthy) allHealthy = false;
    }
    
    return {
      status: allHealthy ? 'healthy' : 'degraded',
      connections,
      metrics: this.metrics
    };
  }
}

const databaseManager = new DatabaseManager();

if (require.main === module) {
  async function demo() {
    try {
      await databaseManager.connect('dynamodb', {
        type: 'dynamodb',
        region: 'us-east-1',
        endpoint: 'http://localhost:8000',
        table: 'hootner-dev',
        credentials: { accessKeyId: 'local', secretAccessKey: 'local' }
      });
      
      await databaseManager.connect('redis', {
        type: 'redis',
        host: 'localhost'
      });
      
      console.log('📊 Health:', databaseManager.healthCheck());
    } catch (error) {
      console.error('Demo failed:', error.message);
    }
  }
  
  demo();
  
  process.on('SIGINT', async () => {
    await databaseManager.closeAll();
    process.exit(0);
  });
}

module.exports = databaseManager;
