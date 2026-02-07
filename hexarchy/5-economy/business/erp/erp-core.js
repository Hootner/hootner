// ERP Core - Minimal Enterprise Resource Planning
export class ERPCore {
  constructor() {
    this.modules = {
      inventory: new InventoryModule(),
      sales: new SalesModule(),
      purchasing: new PurchasingModule(),
      accounting: new AccountingModule(),
      hr: new HRModule()
    };
  }

  async getModule(name) {
    return this.modules[name];
  }

  async getDashboard() {
    return {
      inventory: await this.modules.inventory.getSummary(),
      sales: await this.modules.sales.getSummary(),
      purchasing: await this.modules.purchasing.getSummary(),
      accounting: await this.modules.accounting.getSummary(),
      hr: await this.modules.hr.getSummary()
    };
  }
}

class InventoryModule {
  constructor() {
    this.items = new Map();
  }

  async addItem(item) {
    this.items.set(item.id, { ...item, createdAt: Date.now() });
    return item.id;
  }

  async updateStock(id, quantity) {
    const item = this.items.get(id);
    if (item) item.quantity = quantity;
    return item;
  }

  async getSummary() {
    return {
      totalItems: this.items.size,
      lowStock: Array.from(this.items.values()).filter(i => i.quantity < 10).length
    };
  }
}

class SalesModule {
  constructor() {
    this.orders = new Map();
  }

  async createOrder(order) {
    const id = `SO-${Date.now()}`;
    this.orders.set(id, { ...order, id, status: 'pending', createdAt: Date.now() });
    return id;
  }

  async getSummary() {
    const orders = Array.from(this.orders.values());
    return {
      totalOrders: orders.length,
      revenue: orders.reduce((sum, o) => sum + (o.total || 0), 0)
    };
  }
}

class PurchasingModule {
  constructor() {
    this.pos = new Map();
  }

  async createPO(po) {
    const id = `PO-${Date.now()}`;
    this.pos.set(id, { ...po, id, status: 'pending', createdAt: Date.now() });
    return id;
  }

  async getSummary() {
    return { totalPOs: this.pos.size };
  }
}

class AccountingModule {
  constructor() {
    this.transactions = [];
  }

  async recordTransaction(tx) {
    this.transactions.push({ ...tx, timestamp: Date.now() });
    return tx;
  }

  async getSummary() {
    return {
      totalTransactions: this.transactions.length,
      balance: this.transactions.reduce((sum, t) => sum + (t.amount || 0), 0)
    };
  }
}

class HRModule {
  constructor() {
    this.employees = new Map();
  }

  async addEmployee(emp) {
    this.employees.set(emp.id, { ...emp, hiredAt: Date.now() });
    return emp.id;
  }

  async getSummary() {
    return { totalEmployees: this.employees.size };
  }
}

export default new ERPCore();
