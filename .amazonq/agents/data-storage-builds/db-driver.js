// Minimal Database Driver
class DBDriver {
  constructor(config) {
    this.config = config;
    this.pool = [];
    this.maxConnections = config.poolSize || 5;
  }

  connect() {
    if (this.pool.length < this.maxConnections) {
      const conn = { id: this.pool.length, active: false };
      this.pool.push(conn);
      return conn;
    }
    return this.pool.find(c => !c.active);
  }

  query(sql) {
    const conn = this.connect();
    if (!conn) throw new Error('No connections available');
    conn.active = true;
    console.log(`[Conn ${conn.id}] ${sql}`);
    conn.active = false;
    return { rows: [], rowCount: 0 };
  }
}

const driver = new DBDriver({ host: 'localhost', poolSize: 3 });
driver.query('SELECT * FROM users');

export default DBDriver;
