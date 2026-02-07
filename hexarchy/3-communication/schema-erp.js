export const erpSchema = `
  type InventoryItem {
    id: ID!
    name: String!
    quantity: Int!
    price: Float!
  }

  type SalesOrder {
    id: ID!
    customer: String!
    total: Float!
    status: String!
  }

  type PurchaseOrder {
    id: ID!
    vendor: String!
    total: Float!
    status: String!
  }

  type Employee {
    id: ID!
    name: String!
    department: String!
    salary: Float!
  }

  type ERPDashboard {
    inventory: InventorySummary!
    sales: SalesSummary!
    purchasing: PurchasingSummary!
    accounting: AccountingSummary!
    hr: HRSummary!
  }

  type InventorySummary {
    totalItems: Int!
    lowStock: Int!
  }

  type SalesSummary {
    totalOrders: Int!
    revenue: Float!
  }

  type PurchasingSummary {
    totalPOs: Int!
  }

  type AccountingSummary {
    totalTransactions: Int!
    balance: Float!
  }

  type HRSummary {
    totalEmployees: Int!
  }

  type Query {
    erpDashboard: ERPDashboard!
  }

  type Mutation {
    addInventoryItem(id: ID!, name: String!, quantity: Int!, price: Float!): ID!
    createSalesOrder(customer: String!, total: Float!): ID!
    createPurchaseOrder(vendor: String!, total: Float!): ID!
    addEmployee(id: ID!, name: String!, department: String!, salary: Float!): ID!
  }
`;
