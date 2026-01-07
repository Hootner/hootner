// Minimal Saga Pattern - Distributed Transactions, Compensation
class Saga {
  constructor(name) {
    this.name = name;
    this.steps = [];
    this.compensations = [];
  }

  addStep(action, compensation) {
    this.steps.push(action);
    this.compensations.push(compensation);
    return this;
  }

  async execute(context) {
    console.log(`\n=== Executing Saga: ${this.name} ===`);
    const executedSteps = [];

    try {
      for (let i = 0; i < this.steps.length; i++) {
        console.log(`\nStep ${i + 1}/${this.steps.length}`);
        const result = await this.steps[i](context);
        executedSteps.push(i);
        context = { ...context, ...result };
      }

      console.log('\n✓ Saga completed successfully');
      return { success: true, context };

    } catch (error) {
      console.log(`\n✗ Saga failed: ${error.message}`);
      console.log('Starting compensation...');

      // Compensate in reverse order
      for (let i = executedSteps.length - 1; i >= 0; i--) {
        const stepIndex = executedSteps[i];
        try {
          console.log(`Compensating step ${stepIndex + 1}`);
          await this.compensations[stepIndex](context);
        } catch (compError) {
          console.error(`Compensation failed: ${compError.message}`);
        }
      }

      console.log('✓ Compensation completed');
      return { success: false, error: error.message };
    }
  }
}

// Mock services
class PaymentService {
  async charge(orderId, amount) {
    console.log(`  Charging $${amount} for order ${orderId}`);
    if (Math.random() < 0.3) throw new Error('Payment failed');
    return { paymentId: 'pay_' + Date.now() };
  }

  async refund(paymentId) {
    console.log(`  Refunding payment ${paymentId}`);
  }
}

class InventoryService {
  async reserve(productId, quantity) {
    console.log(`  Reserving ${quantity}x ${productId}`);
    if (Math.random() < 0.2) throw new Error('Out of stock');
    return { reservationId: 'res_' + Date.now() };
  }

  async release(reservationId) {
    console.log(`  Releasing reservation ${reservationId}`);
  }
}

class ShippingService {
  async schedule(orderId, address) {
    console.log(`  Scheduling shipment to ${address}`);
    if (Math.random() < 0.4) throw new Error('Shipping unavailable');
    return { shipmentId: 'ship_' + Date.now() };
  }

  async cancel(shipmentId) {
    console.log(`  Canceling shipment ${shipmentId}`);
  }
}

// Demo: Order Processing Saga
const payment = new PaymentService();
const inventory = new InventoryService();
const shipping = new ShippingService();

const orderSaga = new Saga('OrderProcessing')
  .addStep(
    // Reserve inventory
    async (ctx) => {
      const result = await inventory.reserve(ctx.productId, ctx.quantity);
      return { reservationId: result.reservationId };
    },
    // Compensate: Release inventory
    async (ctx) => {
      await inventory.release(ctx.reservationId);
    }
  )
  .addStep(
    // Charge payment
    async (ctx) => {
      const result = await payment.charge(ctx.orderId, ctx.amount);
      return { paymentId: result.paymentId };
    },
    // Compensate: Refund payment
    async (ctx) => {
      await payment.refund(ctx.paymentId);
    }
  )
  .addStep(
    // Schedule shipping
    async (ctx) => {
      const result = await shipping.schedule(ctx.orderId, ctx.address);
      return { shipmentId: result.shipmentId };
    },
    // Compensate: Cancel shipment
    async (ctx) => {
      await shipping.cancel(ctx.shipmentId);
    }
  );

// Execute saga
(async () => {
  const order = {
    orderId: 'order-123',
    productId: 'prod-456',
    quantity: 2,
    amount: 99.99,
    address: '123 Main St'
  };

  // Try multiple times to see both success and failure scenarios
  for (let i = 1; i <= 3; i++) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`Attempt ${i}`);
    await orderSaga.execute(order);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
})();

export default Saga;
