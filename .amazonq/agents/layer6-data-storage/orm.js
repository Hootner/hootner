#!/usr/bin/env node
/**
 * Layer 6: ORM (Object-Relational Mapping) - Database abstraction layer
 * Dependencies: Layer 2 (Parser), Layer 6 (Relational DB)
 */

class ORM {
  constructor(db) {
    this.db = db; // Database connection
    this.models = new Map();
    this.migrations = [];
  }

  // Define model
  define(name, schema, options = {}) {
    const model = {
      name,
      schema,
      tableName: options.tableName || name.toLowerCase() + 's',
      timestamps: options.timestamps !== false,
      relations: options.relations || {}
    };
    
    this.models.set(name, model);
    console.log(`[MODEL] Defined ${name}`);
    
    return this.createModelClass(model);
  }

  // Create model class
  createModelClass(model) {
    const orm = this;
    
    return class {
      constructor(data = {}) {
        Object.assign(this, data);
      }

      // Save instance
      async save() {
        if (this.id) {
          return orm.update(model.name, { id: this.id }, this);
        } else {
          const id = await orm.create(model.name, this);
          this.id = id;
          return this;
        }
      }

      // Delete instance
      async delete() {
        return orm.delete(model.name, { id: this.id });
      }

      // Static: Find all
      static async findAll(where = {}) {
        return orm.findAll(model.name, where);
      }

      // Static: Find one
      static async findOne(where) {
        return orm.findOne(model.name, where);
      }

      // Static: Find by ID
      static async findById(id) {
        return orm.findOne(model.name, { id });
      }

      // Static: Create
      static async create(data) {
        return orm.create(model.name, data);
      }

      // Static: Update
      static async update(where, data) {
        return orm.update(model.name, where, data);
      }

      // Static: Delete
      static async delete(where) {
        return orm.delete(model.name, where);
      }
    };
  }

  // Create record
  async create(modelName, data) {
    const model = this.models.get(modelName);
    
    if (model.timestamps) {
      data.createdAt = Date.now();
      data.updatedAt = Date.now();
    }
    
    const values = Object.values(data).map(v => `'${v}'`).join(', ');
    const sql = `INSERT INTO ${model.tableName} VALUES (${values})`;
    
    console.log(`[CREATE] ${modelName}`);
    const result = this.db.execute(sql);
    return result.id;
  }

  // Find all records
  async findAll(modelName, where = {}) {
    const model = this.models.get(modelName);
    const whereClause = this.buildWhere(where);
    const sql = `SELECT * FROM ${model.tableName}${whereClause}`;
    
    console.log(`[FIND ALL] ${modelName}`);
    return this.db.execute(sql);
  }

  // Find one record
  async findOne(modelName, where) {
    const results = await this.findAll(modelName, where);
    return results[0] || null;
  }

  // Update records
  async update(modelName, where, data) {
    const model = this.models.get(modelName);
    
    if (model.timestamps) {
      data.updatedAt = Date.now();
    }
    
    const set = Object.entries(data)
      .map(([k, v]) => `${k} = '${v}'`)
      .join(', ');
    const whereClause = this.buildWhere(where);
    const sql = `UPDATE ${model.tableName} SET ${set}${whereClause}`;
    
    console.log(`[UPDATE] ${modelName}`);
    return this.db.execute(sql);
  }

  // Delete records
  async delete(modelName, where) {
    const model = this.models.get(modelName);
    const whereClause = this.buildWhere(where);
    const sql = `DELETE FROM ${model.tableName}${whereClause}`;
    
    console.log(`[DELETE] ${modelName}`);
    return this.db.execute(sql);
  }

  // Build WHERE clause
  buildWhere(where) {
    if (Object.keys(where).length === 0) return '';
    
    const conditions = Object.entries(where)
      .map(([k, v]) => `${k} = '${v}'`)
      .join(' AND ');
    
    return ` WHERE ${conditions}`;
  }

  // Create migration
  migration(name, up, down) {
    this.migrations.push({ name, up, down, executed: false });
    console.log(`[MIGRATION] Created ${name}`);
  }

  // Run migrations
  async migrate() {
    console.log('[MIGRATE] Running pending migrations');
    
    for (const migration of this.migrations) {
      if (!migration.executed) {
        await migration.up(this.db);
        migration.executed = true;
        console.log(`[MIGRATED] ${migration.name}`);
      }
    }
  }

  // Rollback migrations
  async rollback() {
    console.log('[ROLLBACK] Rolling back last migration');
    
    for (let i = this.migrations.length - 1; i >= 0; i--) {
      const migration = this.migrations[i];
      if (migration.executed) {
        await migration.down(this.db);
        migration.executed = false;
        console.log(`[ROLLED BACK] ${migration.name}`);
        break;
      }
    }
  }
}

// Demo
if (require.main === module) {
  // Mock database
  const mockDB = {
    tables: new Map(),
    execute(sql) {
      console.log(`  SQL: ${sql}`);
      return { id: 1, inserted: 1 };
    }
  };
  
  const orm = new ORM(mockDB);
  
  console.log('=== ORM Demo ===\n');
  
  // Define models
  const User = orm.define('User', {
    id: { type: 'INTEGER', primaryKey: true },
    name: { type: 'STRING', required: true },
    email: { type: 'STRING', unique: true }
  }, {
    timestamps: true
  });
  
  const Post = orm.define('Post', {
    id: { type: 'INTEGER', primaryKey: true },
    title: { type: 'STRING' },
    userId: { type: 'INTEGER', references: 'User' }
  });
  
  console.log();
  
  // Create migration
  orm.migration('create_users', 
    async (db) => {
      db.execute('CREATE TABLE users (id INTEGER, name TEXT, email TEXT)');
    },
    async (db) => {
      db.execute('DROP TABLE users');
    }
  );
  
  console.log();
  
  // Use models
  (async () => {
    // Create
    await User.create({ name: 'Alice', email: 'alice@example.com' });
    
    // Find
    await User.findAll({ name: 'Alice' });
    
    // Update
    await User.update({ name: 'Alice' }, { email: 'alice@newdomain.com' });
    
    console.log();
    
    // Run migrations
    await orm.migrate();
  })();
}

module.exports = ORM;
