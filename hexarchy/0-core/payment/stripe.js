// Stripe Payment Gateway Configuration
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});

export const stripeConfig = {
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  currency: 'usd'
};

// Create payment intent
export const createPaymentIntent = async ({ amount, currency = 'usd', metadata = {} }) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true
      }
    });

    return {
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id
    };
  } catch (error) {
    console.error('Stripe payment intent creation failed:', error);
    throw error;
  }
};

// Create subscription
export const createSubscription = async ({ customerId, priceId, metadata = {} }) => {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      metadata,
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent']
    });

    return subscription;
  } catch (error) {
    console.error('Stripe subscription creation failed:', error);
    throw error;
  }
};

// Create customer
export const createCustomer = async ({ email, name, metadata = {} }) => {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata
    });

    return customer;
  } catch (error) {
    console.error('Stripe customer creation failed:', error);
    throw error;
  }
};

// Verify webhook signature
export const verifyWebhook = (payload, signature) => {
  try {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      stripeConfig.webhookSecret
    );
  } catch (error) {
    console.error('Webhook verification failed:', error);
    throw error;
  }
};

export { stripe };
export default stripe;
