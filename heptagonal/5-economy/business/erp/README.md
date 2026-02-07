# HOOTNER ERP System

**Minimal Enterprise Resource Planning built into the 9-layer hexarchy**

## Architecture Mapping

### Layer 5 (Economy) - Business Logic
- **`erp-core.js`** - Core ERP modules (Inventory, Sales, Purchasing, Accounting, HR)

### Layer 3 (Communication) - API Layer
- **`schema-erp.js`** - GraphQL schema definitions
- **`resolvers-erp.js`** - GraphQL resolvers

### Layer 4 (Interface) - UI Layer
- **`erp-dashboard.html`** - Dashboard interface

## Modules

1. **Inventory** - Stock management, low stock alerts
2. **Sales** - Order processing, revenue tracking
3. **Purchasing** - Purchase orders
4. **Accounting** - Transaction recording, balance tracking
5. **HR** - Employee management

## Quick Start

```bash
# Start the platform
npm run start:all

# Access ERP Dashboard
# Open: http://localhost:3000/erp-dashboard.html
```

## API Usage

```graphql
# Get Dashboard
query {
  erpDashboard {
    inventory { totalItems lowStock }
    sales { totalOrders revenue }
    hr { totalEmployees }
  }
}

# Add Inventory Item
mutation {
  addInventoryItem(id: "ITEM001", name: "Widget", quantity: 100, price: 29.99)
}

# Create Sales Order
mutation {
  createSalesOrder(customer: "Acme Corp", total: 1500.00)
}
```

## Integration Points

- Uses existing **DynamoDB** (Layer 0) for persistence
- Uses existing **GraphQL** (Layer 3) for API
- Uses existing **Stripe** (Layer 5) for payments
- Uses existing **Auth** (Layer 0) for security

## Extend

Add new modules in `hexarchy/5-economy/business/erp/`:
- Manufacturing
- CRM
- Project Management
- Supply Chain
