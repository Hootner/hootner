#!/usr/bin/env node
/**
 * Layer 7: REST API - RESTful API server
 * Dependencies: Layer 6 (Database), Layer 7 (HTTP Server, Web Framework)
 */

class RESTAPI {
  constructor(db) {
    this.db = db;
    this.resources = new Map();
    this.validators = new Map();
  }

  // Register resource
  resource(name, options = {}) {
    this.resources.set(name, {
      name,
      schema: options.schema || {},
      hooks: options.hooks || {}
    });
    console.log(`[RESOURCE] Registered ${name}`);
  }

  // Add validator
  validate(resource, validator) {
    this.validators.set(resource, validator);
  }

  // List all (GET /resources)
  async list(resource, query = {}) {
    console.log(`[LIST] ${resource}`);
    
    const res = this.resources.get(resource);
    if (!res) return { status: 404, data: { error: 'Resource not found' } };
    
    // Apply filters
    const filters = this.parseFilters(query);
    const items = await this.db.findAll(resource, filters);
    
    // Pagination
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const start = (page - 1) * limit;
    const paginated = items.slice(start, start + limit);
    
    return {
      status: 200,
      data: {
        items: paginated,
        total: items.length,
        page,
        limit
      }
    };
  }

  // Get one (GET /resources/:id)
  async get(resource, id) {
    console.log(`[GET] ${resource}/${id}`);
    
    const item = await this.db.findOne(resource, { id });
    
    if (!item) {
      return { status: 404, data: { error: 'Not found' } };
    }
    
    return { status: 200, data: item };
  }

  // Create (POST /resources)
  async create(resource, data) {
    console.log(`[CREATE] ${resource}`);
    
    const res = this.resources.get(resource);
    
    // Validate
    const validation = this.validateData(resource, data);
    if (!validation.valid) {
      return { status: 400, data: { errors: validation.errors } };
    }
    
    // Before hook
    if (res.hooks.beforeCreate) {
      data = await res.hooks.beforeCreate(data);
    }
    
    const id = await this.db.insert(resource, data);
    const created = await this.db.findOne(resource, { id });
    
    // After hook
    if (res.hooks.afterCreate) {
      await res.hooks.afterCreate(created);
    }
    
    return { status: 201, data: created };
  }

  // Update (PUT /resources/:id)
  async update(resource, id, data) {
    console.log(`[UPDATE] ${resource}/${id}`);
    
    const existing = await this.db.findOne(resource, { id });
    if (!existing) {
      return { status: 404, data: { error: 'Not found' } };
    }
    
    // Validate
    const validation = this.validateData(resource, data, true);
    if (!validation.valid) {
      return { status: 400, data: { errors: validation.errors } };
    }
    
    await this.db.update(resource, { id }, data);
    const updated = await this.db.findOne(resource, { id });
    
    return { status: 200, data: updated };
  }

  // Delete (DELETE /resources/:id)
  async delete(resource, id) {
    console.log(`[DELETE] ${resource}/${id}`);
    
    const existing = await this.db.findOne(resource, { id });
    if (!existing) {
      return { status: 404, data: { error: 'Not found' } };
    }
    
    await this.db.delete(resource, { id });
    
    return { status: 204, data: null };
  }

  // Validate data
  validateData(resource, data, partial = false) {
    const validator = this.validators.get(resource);
    if (!validator) return { valid: true };
    
    const errors = [];
    
    for (const [field, rules] of Object.entries(validator)) {
      const value = data[field];
      
      if (rules.required && !partial && !value) {
        errors.push(`${field} is required`);
      }
      
      if (value && rules.type && typeof value !== rules.type) {
        errors.push(`${field} must be ${rules.type}`);
      }
      
      if (value && rules.min && value.length < rules.min) {
        errors.push(`${field} must be at least ${rules.min} characters`);
      }
      
      if (value && rules.max && value.length > rules.max) {
        errors.push(`${field} must be at most ${rules.max} characters`);
      }
    }
    
    return { valid: errors.length === 0, errors };
  }

  // Parse filters
  parseFilters(query) {
    const filters = {};
    for (const [key, value] of Object.entries(query)) {
      if (!['page', 'limit', 'sort'].includes(key)) {
        filters[key] = value;
      }
    }
    return filters;
  }
}

// Demo
if (require.main === module) {
  // Mock database
  const mockDB = {
    data: new Map([
      ['users', [
        { id: 1, name: 'Alice', email: 'alice@example.com' },
        { id: 2, name: 'Bob', email: 'bob@example.com' }
      ]]
    ]),
    nextId: 3,
    
    async findAll(resource, filters) {
      const items = this.data.get(resource) || [];
      return items.filter(item => {
        for (const [key, value] of Object.entries(filters)) {
          if (item[key] !== value) return false;
        }
        return true;
      });
    },
    
    async findOne(resource, filters) {
      const items = await this.findAll(resource, filters);
      return items[0] || null;
    },
    
    async insert(resource, data) {
      const items = this.data.get(resource) || [];
      const id = this.nextId++;
      items.push({ id, ...data });
      return id;
    },
    
    async update(resource, filters, data) {
      const items = this.data.get(resource) || [];
      for (const item of items) {
        let match = true;
        for (const [key, value] of Object.entries(filters)) {
          if (item[key] !== value) match = false;
        }
        if (match) Object.assign(item, data);
      }
    },
    
    async delete(resource, filters) {
      const items = this.data.get(resource) || [];
      const filtered = items.filter(item => {
        for (const [key, value] of Object.entries(filters)) {
          if (item[key] === value) return false;
        }
        return true;
      });
      this.data.set(resource, filtered);
    }
  };
  
  const api = new RESTAPI(mockDB);
  
  console.log('=== REST API Demo ===\n');
  
  // Register resource
  api.resource('users', {
    schema: {
      name: 'string',
      email: 'string'
    }
  });
  
  // Add validator
  api.validate('users', {
    name: { required: true, type: 'string', min: 2 },
    email: { required: true, type: 'string' }
  });
  
  console.log();
  
  (async () => {
    // List
    const list = await api.list('users', { page: 1, limit: 10 });
    console.log('List:', list.data.items.length, 'users\n');
    
    // Get
    const get = await api.get('users', 1);
    console.log('Get:', get.data.name, '\n');
    
    // Create
    const create = await api.create('users', { name: 'Charlie', email: 'charlie@example.com' });
    console.log('Created:', create.data.name, '\n');
    
    // Update
    const update = await api.update('users', 1, { name: 'Alice Updated' });
    console.log('Updated:', update.data.name, '\n');
    
    // Delete
    await api.delete('users', 2);
    console.log('Deleted user 2');
  })();
}

module.exports = RESTAPI;
