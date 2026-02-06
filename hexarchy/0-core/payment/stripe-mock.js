// Mock Stripe Service - Use when Stripe dashboard is inaccessible
// This allows development to continue without real Stripe credentials

export const mockStripe = {
  paymentIntents: {
    create: async (params) => ({
      id: `pi_mock_${Date.now()}`,
      client_secret: `pi_mock_${Date.now()}_secret_mock`,
      amount: params.amount,
      currency: params.currency,
      status: 'succeeded'
    })
  },
  
  customers: {
    create: async (params) => ({
      id: `cus_mock_${Date.now()}`,
      email: params.email,
      name: params.name
    })
  },
  
  subscriptions: {
    create: async (params) => ({
      id: `sub_mock_${Date.now()}`,
      customer: params.customer,
      status: 'active',
      latest_invoice: {
        payment_intent: {
          client_secret: 'mock_secret'
        }
      }
    })
  }
};

// Use this in development when Stripe is unavailable
export const getStripeClient = () => {
  const isDev = process.env.NODE_ENV === 'development';
  const hasRealKey = process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_51') || 
                     process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_');
  
  if (isDev && !hasRealKey) {
    console.warn('⚠️  Using MOCK Stripe - No real payments will be processed');
    return mockStripe;
  }
  
  // Use real Stripe when credentials are available
  const Stripe = require('stripe');
  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

export default getStripeClient;
