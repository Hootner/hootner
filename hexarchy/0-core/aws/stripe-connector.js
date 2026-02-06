export const stripeConnector = {
  connect: async () => console.log('Stripe connector initialized'),
  createUsageRecord: async (params) => ({ id: 'usage_test' })
}

export default stripeConnector