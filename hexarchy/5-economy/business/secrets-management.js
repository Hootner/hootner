/**
 * Secrets Management Service
 * HashiCorp Vault integration with credential rotation
 */

class SecretsManagement {
  constructor() {
    this.vault = new Map();
    this.rotationSchedules = new Map();
    this.accessLogs = new Map();
    this.policies = new Map();
    
    this.initializeVault();
    this.initializePolicies();
  }

  initializeVault() {
    const secrets = [
      { path: 'database/primary', type: 'database', ttl: 86400 },
      { path: 'api/stripe', type: 'api_key', ttl: 2592000 },
      { path: 'certificates/ssl', type: 'certificate', ttl: 7776000 },
      { path: 'jwt/signing', type: 'signing_key', ttl: 604800 },
      { path: 'encryption/master', type: 'encryption_key', ttl: 31536000 }
    ];

    secrets.forEach(secret => {
      this.vault.set(secret.path, {
        ...secret,
        value: this.generateSecretValue(secret.type),
        createdAt: new Date().toISOString(),
        lastRotated: new Date().toISOString(),
        version: 1,
        status: 'active'
      });
    });
  }

  initializePolicies() {
    const policies = [
      {
        name: 'admin',
        paths: ['*'],
        capabilities: ['create', 'read', 'update', 'delete', 'list']
      },
      {
        name: 'app-server',
        paths: ['database/*', 'api/*', 'jwt/*'],
        capabilities: ['read']
      },
      {
        name: 'backup-service',
        paths: ['database/backup', 'encryption/*'],
        capabilities: ['read']
      }
    ];

    policies.forEach(policy => {
      this.policies.set(policy.name, policy);
    });
  }

  generateSecretValue(type) {
    const generators = {
      database: () => `db_${Math.random().toString(36).substr(2, 16)}`,
      api_key: () => `sk_${Math.random().toString(36).substr(2, 32)}`,
      certificate: () => `-----BEGIN CERTIFICATE-----\n${Math.random().toString(36).substr(2, 64)}\n-----END CERTIFICATE-----`,
      signing_key: () => Math.random().toString(36).substr(2, 64),
      encryption_key: () => Array.from({length: 32}, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('')
    };

    return generators[type] ? generators[type]() : Math.random().toString(36).substr(2, 32);
  }

  async getSecret({ path, version = null }) {
    console.log(`🔐 Retrieving secret: ${path}`);
    
    // Validate path to prevent directory traversal
    if (!path || typeof path !== 'string' || path.includes('..') || path.includes('/') || path.includes('\\')) {
      throw new Error('Invalid secret path');
    }
    
    const secret = this.vault.get(path);
    if (!secret) {
      throw new Error(`Secret not found: ${path}`);
    }

    // Log access
    await this.logAccess(path, 'read');
    
    return {
      path,
      value: secret.value,
      version: secret.version,
      createdAt: secret.createdAt,
      lastRotated: secret.lastRotated,
      ttl: secret.ttl,
      metadata: {
        type: secret.type,
        status: secret.status
      }
    };
  }

  async createSecret({ path, value, type = 'generic', ttl = 86400 }) {
    console.log(`🔒 Creating secret: ${path}`);
    
    // Validate inputs
    if (!path || typeof path !== 'string' || path.includes('..') || path.includes('/') || path.includes('\\')) {
      throw new Error('Invalid secret path');
    }
    
    if (ttl && (typeof ttl !== 'number' || ttl < 0 || ttl > 31536000)) { // Max 1 year
      throw new Error('Invalid TTL value');
    }
    
    if (this.vault.has(path)) {
      throw new Error(`Secret already exists: ${path}`);
    }

    const secret = {
      path,
      value: value || this.generateSecretValue(type),
      type,
      ttl,
      createdAt: new Date().toISOString(),
      lastRotated: new Date().toISOString(),
      version: 1,
      status: 'active'
    };

    this.vault.set(path, secret);
    
    // Schedule rotation if TTL is set
    if (ttl > 0) {
      await this.scheduleRotation(path, ttl);
    }
    
    await this.logAccess(path, 'create');
    
    return { path, version: secret.version };
  }

  async updateSecret({ path, value, version = null }) {
    console.log(`🔄 Updating secret: ${path}`);
    
    const secret = this.vault.get(path);
    if (!secret) {
      throw new Error(`Secret not found: ${path}`);
    }

    // Version check if specified
    if (version && secret.version !== version) {
      throw new Error(`Version mismatch: expected ${version}, got ${secret.version}`);
    }

    secret.value = value || this.generateSecretValue(secret.type);
    secret.version += 1;
    secret.lastRotated = new Date().toISOString();
    
    await this.logAccess(path, 'update');
    
    return { path, version: secret.version };
  }

  async rotateSecret({ secretId, type = 'manual' }) {
    console.log(`🔄 Rotating secret: ${secretId} (${type})`);
    
    const rotationId = `rot_${Date.now()}`;
    
    const rotation = {
      id: rotationId,
      secretPath: secretId,
      type,
      status: 'in_progress',
      startTime: new Date().toISOString(),
      steps: []
    };

    try {
      // Step 1: Generate new secret
      rotation.steps.push({ step: 'generate', status: 'completed', timestamp: new Date().toISOString() });
      
      // Step 2: Update vault
      const result = await this.updateSecret({ path: secretId });
      rotation.steps.push({ step: 'update_vault', status: 'completed', timestamp: new Date().toISOString() });
      
      // Step 3: Notify dependent services
      await this.notifyDependentServices(secretId);
      rotation.steps.push({ step: 'notify_services', status: 'completed', timestamp: new Date().toISOString() });
      
      // Step 4: Verify rotation
      await this.verifyRotation(secretId);
      rotation.steps.push({ step: 'verify', status: 'completed', timestamp: new Date().toISOString() });
      
      rotation.status = 'completed';
      rotation.endTime = new Date().toISOString();
      rotation.newVersion = result.version;
      
    } catch (error) {
      rotation.status = 'failed';
      rotation.error = error.message;
      rotation.endTime = new Date().toISOString();
    }
    
    this.rotationSchedules.set(rotationId, rotation);
    
    return rotation;
  }

  async notifyDependentServices(secretPath) {
    // Mock service notification
    const dependentServices = this.getDependentServices(secretPath);
    
    for (const service of dependentServices) {
      console.log(`📢 Notifying service: ${service} about secret rotation`);
      // In production, this would make API calls to restart/reload services
    }
  }

  getDependentServices(secretPath) {
    const dependencies = {
      'database/primary': ['video-service', 'user-service', 'payment-service'],
      'api/stripe': ['payment-service'],
      'jwt/signing': ['auth-service', 'api-gateway'],
      'certificates/ssl': ['load-balancer', 'api-gateway']
    };
    
    return dependencies[secretPath] || [];
  }

  async verifyRotation(secretPath) {
    // Mock rotation verification
    const secret = this.vault.get(secretPath);
    if (!secret) {
      throw new Error('Secret not found after rotation');
    }
    
    // Simulate verification checks
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { verified: true, timestamp: new Date().toISOString() };
  }

  async scheduleRotation(secretPath, ttl) {
    const rotationTime = Date.now() + (ttl * 1000 * 0.8); // Rotate at 80% of TTL
    
    const schedule = {
      secretPath,
      scheduledTime: new Date(rotationTime).toISOString(),
      ttl,
      status: 'scheduled'
    };
    
    this.rotationSchedules.set(`schedule_${secretPath}`, schedule);
    
    // In production, this would use a proper scheduler
    setTimeout(async () => {
      await this.rotateSecret({ secretId: secretPath, type: 'automatic' });
    }, Math.min(ttl * 800, 60000)); // Max 1 minute for demo
    
    return schedule;
  }

  async logAccess(path, operation) {
    const logId = `access_${Date.now()}`;
    
    const logEntry = {
      id: logId,
      path,
      operation,
      timestamp: new Date().toISOString(),
      user: 'system', // In production, get from context
      sourceIP: '127.0.0.1' // In production, get from request
    };
    
    if (!this.accessLogs.has(path)) {
      this.accessLogs.set(path, []);
    }
    
    const pathLogs = this.accessLogs.get(path);
    pathLogs.push(logEntry);
    
    // Keep only recent logs
    if (pathLogs.length > 100) {
      pathLogs.splice(0, pathLogs.length - 100);
    }
    
    return logEntry;
  }

  async manage({ vault = 'hashicorp', rotation = 'automatic', encryption = 'aes256' }) {
    console.log(`🔐 Managing secrets with ${vault} vault`);
    
    const management = {
      id: `mgmt_${Date.now()}`,
      vault,
      rotation,
      encryption,
      startTime: new Date().toISOString(),
      status: 'active',
      settings: {
        autoRotation: rotation === 'automatic',
        encryptionAlgorithm: encryption,
        auditLogging: true,
        accessControl: true
      },
      metrics: {
        totalSecrets: this.vault.size,
        activeRotations: Array.from(this.rotationSchedules.values()).filter(r => r.status === 'in_progress').length,
        scheduledRotations: Array.from(this.rotationSchedules.values()).filter(r => r.status === 'scheduled').length
      }
    };
    
    return management;
  }

  async getSecretMetrics(timeRange = '24h') {
    return {
      timeRange,
      generatedAt: new Date().toISOString(),
      totalSecrets: this.vault.size,
      secretsByType: this.getSecretsByType(),
      accessStats: {
        totalAccesses: this.getTotalAccesses(),
        topAccessedSecrets: this.getTopAccessedSecrets(),
        accessByOperation: this.getAccessByOperation()
      },
      rotationStats: {
        totalRotations: Array.from(this.rotationSchedules.values()).length,
        successfulRotations: Array.from(this.rotationSchedules.values()).filter(r => r.status === 'completed').length,
        failedRotations: Array.from(this.rotationSchedules.values()).filter(r => r.status === 'failed').length,
        scheduledRotations: Array.from(this.rotationSchedules.values()).filter(r => r.status === 'scheduled').length
      },
      securityMetrics: {
        averageSecretAge: this.calculateAverageSecretAge(),
        secretsNearExpiry: this.getSecretsNearExpiry(),
        complianceScore: this.calculateComplianceScore()
      }
    };
  }

  getSecretsByType() {
    const types = {};
    for (const secret of this.vault.values()) {
      types[secret.type] = (types[secret.type] || 0) + 1;
    }
    return types;
  }

  getTotalAccesses() {
    return Array.from(this.accessLogs.values()).reduce((total, logs) => total + logs.length, 0);
  }

  getTopAccessedSecrets() {
    return Array.from(this.accessLogs.entries())
      .map(([path, logs]) => ({ path, accessCount: logs.length }))
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, 5);
  }

  getAccessByOperation() {
    const operations = {};
    for (const logs of this.accessLogs.values()) {
      for (const log of logs) {
        operations[log.operation] = (operations[log.operation] || 0) + 1;
      }
    }
    return operations;
  }

  calculateAverageSecretAge() {
    const now = Date.now();
    const ages = Array.from(this.vault.values()).map(secret => 
      (now - new Date(secret.createdAt).getTime()) / (1000 * 60 * 60 * 24) // Days
    );
    
    return ages.length > 0 ? ages.reduce((sum, age) => sum + age, 0) / ages.length : 0;
  }

  getSecretsNearExpiry() {
    const now = Date.now();
    const nearExpiry = [];
    
    for (const secret of this.vault.values()) {
      const expiryTime = new Date(secret.lastRotated).getTime() + (secret.ttl * 1000);
      const timeToExpiry = expiryTime - now;
      
      if (timeToExpiry < 7 * 24 * 60 * 60 * 1000) { // 7 days
        nearExpiry.push({
          path: secret.path,
          expiresIn: Math.max(0, Math.floor(timeToExpiry / (1000 * 60 * 60 * 24))) // Days
        });
      }
    }
    
    return nearExpiry;
  }

  calculateComplianceScore() {
    let score = 100;
    const secrets = Array.from(this.vault.values());
    
    // Deduct points for old secrets
    const oldSecrets = secrets.filter(s => {
      const age = Date.now() - new Date(s.lastRotated).getTime();
      return age > s.ttl * 1000;
    });
    
    score -= (oldSecrets.length / secrets.length) * 30;
    
    // Deduct points for weak secret types
    const weakSecrets = secrets.filter(s => s.type === 'generic');
    score -= (weakSecrets.length / secrets.length) * 20;
    
    return Math.max(0, Math.round(score));
  }

  async deleteSecret({ path }) {
    console.log(`🗑️ Deleting secret: ${path}`);
    
    if (!this.vault.has(path)) {
      throw new Error(`Secret not found: ${path}`);
    }
    
    this.vault.delete(path);
    this.accessLogs.delete(path);
    
    await this.logAccess(path, 'delete');
    
    return { path, deleted: true };
  }

  async listSecrets({ prefix = '' }) {
    return Array.from(this.vault.entries())
      .filter(([path]) => path.startsWith(prefix))
      .map(([path, secret]) => ({
        path,
        type: secret.type,
        version: secret.version,
        createdAt: secret.createdAt,
        lastRotated: secret.lastRotated,
        status: secret.status
      }));
  }

  async getRotationStatus(rotationId) {
    return this.rotationSchedules.get(rotationId) || null;
  }
}

module.exports = new SecretsManagement();