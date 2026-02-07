import erpCore from '../../5-economy/business/erp/erp-core.js';

export const erpResolvers = {
  Query: {
    erpDashboard: async () => {
      return await erpCore.getDashboard();
    }
  },
  Mutation: {
    addInventoryItem: async (_, { id, name, quantity, price }) => {
      const inventory = await erpCore.getModule('inventory');
      return await inventory.addItem({ id, name, quantity, price });
    },
    createSalesOrder: async (_, { customer, total }) => {
      const sales = await erpCore.getModule('sales');
      return await sales.createOrder({ customer, total });
    },
    createPurchaseOrder: async (_, { vendor, total }) => {
      const purchasing = await erpCore.getModule('purchasing');
      return await purchasing.createPO({ vendor, total });
    },
    addEmployee: async (_, { id, name, department, salary }) => {
      const hr = await erpCore.getModule('hr');
      return await hr.addEmployee({ id, name, department, salary });
    }
  }
};
