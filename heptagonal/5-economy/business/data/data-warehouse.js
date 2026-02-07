/**
 * Data Warehouse Service
 * Analytics storage with dimensional modeling
 */

class DataWarehouse {
  constructor() {
    this.tables = new Map();
    this.schemas = new Map();
    this.partitions = new Map();
    this.indexes = new Map();
    
    this.initializeSchemas();
  }

  initializeSchemas() {
    // User events fact table
    this.schemas.set('user_events', {
      columns: {
        event_id: 'string',
        user_id: 'string',
        event_type: 'string',
        timestamp: 'datetime',
        session_id: 'string',
        properties: 'json'
      },
      partitions: ['date'],
      indexes: ['user_id', 'event_type', 'timestamp']
    });

    // Video analytics fact table
    this.schemas.set('video_analytics', {
      columns: {
        video_id: 'string',
        user_id: 'string',
        watch_duration: 'integer',
        completion_rate: 'float',
        quality: 'string',
        timestamp: 'datetime'
      },
      partitions: ['date'],
      indexes: ['video_id', 'user_id']
    });

    // Revenue fact table
    this.schemas.set('revenue_facts', {
      columns: {
        transaction_id: 'string',
        user_id: 'string',
        amount: 'decimal',
        currency: 'string',
        plan_type: 'string',
        timestamp: 'datetime'
      },
      partitions: ['date', 'currency'],
      indexes: ['user_id', 'plan_type']
    });
  }

  async storeData({ table, data, batchSize = 1000 }) {
    console.log(`📊 Storing data in warehouse table: ${table}`);
    
    if (!this.schemas.has(table)) {
      throw new Error(`Table ${table} not found in warehouse schema`);
    }

    const schema = this.schemas.get(table);
    const validatedData = this.validateData(data, schema);
    
    if (!this.tables.has(table)) {
      this.tables.set(table, []);
    }

    const tableData = this.tables.get(table);
    
    if (Array.isArray(validatedData)) {
      // Batch insert
      for (let i = 0; i < validatedData.length; i += batchSize) {
        const batch = validatedData.slice(i, i + batchSize);
        tableData.push(...batch);
      }
    } else {
      // Single record
      tableData.push(validatedData);
    }

    // Maintain partition info
    this.updatePartitions(table, validatedData);
    
    return {
      table,
      recordsInserted: Array.isArray(validatedData) ? validatedData.length : 1,
      totalRecords: tableData.length,
      timestamp: new Date().toISOString()
    };
  }

  validateData(data, schema) {
    const validate = (record) => {
      const validated = {};
      
      for (const [column, type] of Object.entries(schema.columns)) {
        if (record[column] !== undefined) {
          validated[column] = this.castType(record[column], type);
        }
      }
      
      // Add metadata
      validated._inserted_at = new Date().toISOString();
      validated._partition_key = this.generatePartitionKey(validated, schema.partitions);
      
      return validated;
    };

    return Array.isArray(data) ? data.map(validate) : validate(data);
  }

  castType(value, type) {
    switch (type) {
      case 'string': return String(value);
      case 'integer': return parseInt(value);
      case 'float': return parseFloat(value);
      case 'decimal': return parseFloat(value);
      case 'datetime': return new Date(value).toISOString();
      case 'json': return typeof value === 'object' ? value : JSON.parse(value);
      default: return value;
    }
  }

  generatePartitionKey(record, partitions) {
    return partitions.map(partition => {
      if (partition === 'date' && record.timestamp) {
        return new Date(record.timestamp).toISOString().split('T')[0];
      }
      return record[partition] || 'unknown';
    }).join('|');
  }

  updatePartitions(table, data) {
    if (!this.partitions.has(table)) {
      this.partitions.set(table, new Set());
    }

    const partitionSet = this.partitions.get(table);
    const records = Array.isArray(data) ? data : [data];
    
    records.forEach(record => {
      if (record._partition_key) {
        partitionSet.add(record._partition_key);
      }
    });
  }

  async query({ table, dimensions = [], metrics = [], filters = {}, limit = 1000 }) {
    console.log(`🔍 Querying warehouse table: ${table}`);
    
    if (!this.tables.has(table)) {
      return { data: [], totalRows: 0, executionTime: 0 };
    }

    const startTime = Date.now();
    let data = this.tables.get(table);
    
    // Apply filters
    data = this.applyFilters(data, filters);
    
    // Group by dimensions and aggregate metrics
    const result = this.aggregateData(data, dimensions, metrics);
    
    // Apply limit
    const limitedResult = result.slice(0, limit);
    
    return {
      data: limitedResult,
      totalRows: result.length,
      executionTime: Date.now() - startTime,
      query: { table, dimensions, metrics, filters, limit }
    };
  }

  applyFilters(data, filters) {
    return data.filter(record => {
      for (const [field, condition] of Object.entries(filters)) {
        if (field === 'date_range') {
          const days = parseInt(condition.replace('d', ''));
          const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
          if (new Date(record.timestamp) < cutoff) return false;
        } else if (record[field] !== condition) {
          return false;
        }
      }
      return true;
    });
  }

  aggregateData(data, dimensions, metrics) {
    if (dimensions.length === 0) {
      // No grouping, just aggregate all data
      return [this.calculateMetrics(data, metrics)];
    }

    // Group by dimensions
    const groups = new Map();
    
    data.forEach(record => {
      const key = dimensions.map(dim => record[dim] || 'unknown').join('|');
      
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      
      groups.get(key).push(record);
    });

    // Calculate metrics for each group
    const result = [];
    
    for (const [key, groupData] of groups.entries()) {
      const dimensionValues = key.split('|');
      const row = {};
      
      // Add dimension values
      dimensions.forEach((dim, index) => {
        row[dim] = dimensionValues[index];
      });
      
      // Add calculated metrics
      Object.assign(row, this.calculateMetrics(groupData, metrics));
      
      result.push(row);
    }

    return result.sort((a, b) => {
      const aKey = dimensions.map(dim => a[dim]).join('');
      const bKey = dimensions.map(dim => b[dim]).join('');
      return aKey.localeCompare(bKey);
    });
  }

  calculateMetrics(data, metrics) {
    const result = {};
    
    metrics.forEach(metric => {
      switch (metric) {
        case 'count':
          result.count = data.length;
          break;
        case 'unique_users':
          result.unique_users = new Set(data.map(r => r.user_id)).size;
          break;
        case 'sum_amount':
          result.sum_amount = data.reduce((sum, r) => sum + (r.amount || 0), 0);
          break;
        case 'avg_duration':
          result.avg_duration = data.reduce((sum, r) => sum + (r.watch_duration || 0), 0) / data.length;
          break;
        case 'completion_rate':
          result.completion_rate = data.reduce((sum, r) => sum + (r.completion_rate || 0), 0) / data.length;
          break;
        default:
          result[metric] = data.length; // Default to count
      }
    });
    
    return result;
  }

  async createTable({ name, schema, partitions = [], indexes = [] }) {
    console.log(`🏗️ Creating warehouse table: ${name}`);
    
    this.schemas.set(name, {
      columns: schema,
      partitions,
      indexes,
      createdAt: new Date().toISOString()
    });
    
    this.tables.set(name, []);
    this.partitions.set(name, new Set());
    
    return { table: name, status: 'created' };
  }

  async getTableStats(table) {
    if (!this.tables.has(table)) {
      throw new Error(`Table ${table} not found`);
    }

    const data = this.tables.get(table);
    const schema = this.schemas.get(table);
    const partitions = this.partitions.get(table);
    
    return {
      table,
      totalRows: data.length,
      partitions: partitions.size,
      schema: schema.columns,
      sizeEstimate: `${Math.round(JSON.stringify(data).length / 1024)}KB`,
      lastUpdated: data.length > 0 ? data[data.length - 1]._inserted_at : null
    };
  }

  async query({ table, dimensions = [], metrics = ['count'], filters = {} }) {
    console.log(`🔍 Querying data warehouse: ${table}`);
    return await this.query({ table, dimensions, metrics, filters });
  }
}

module.exports = new DataWarehouse();