
import xss from 'xss';

const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return xss(input);
  }
  return input;
};
import express from 'express';

// CSRF protection middleware
const csrfCheck = (req, res, next) => {
  const token = req.headers['x-csrf-token'] || req.body._token;
  if (!token || token !== req.session?.csrfToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  next();
};
import { listProducts } from '../models/Product.js';
import { createOrder, listOrders } from '../models/Order.js';
import Stripe from 'stripe';

const router = express.Router();

// Initialize Stripe only if key is provided
const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeKey ? new Stripe(stripeKey) : null;

// GET /products - List products with filtering and pagination
router.get('/products', async (req, res) => {
  try {
    const { category, search, sort, page = 1, limit = 12 } = req.query;

    const allProducts = await listProducts();

    let filtered = allProducts.filter((p) => p.active !== false);
    if (category && category !== 'all') {
      filtered = filtered.filter((p) => p.category === category);
    }
    if (search) {
      const q = String(search).toLowerCase();
      filtered = filtered.filter(
        (p) =>
          (p.name || '').toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q)
      );
    }

    if (sort === 'price-low') filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    else if (sort === 'price-high')
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    else if (sort === 'name')
      filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const start = (pageNum - 1) * limitNum;
    const products = filtered.slice(start, start + limitNum);

    res.json({ products, hasMore: start + products.length < filtered.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /checkout - Create checkout session and order
router.post('/checkout', csrfCheck, async (req, res) => {
  try {
    const { items: sanitizeInput(items), userId: sanitizeInput(userId) } = req.body;

    const total = (items || []).reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order = await createOrder({
      userId,
      items,
      total,
      status: 'pending',
    });

    if (!stripe) {
      return res.json({
        sessionId: null,
        orderId: order.orderId,
        message: 'Stripe not configured. Order created without checkout session.',
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: (items || []).map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: { name: item.name },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || ''}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || ''}/cancel`,
      metadata: { orderId: order.orderId },
    });

    res.json({ sessionId: session.id, orderId: order.orderId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /orders/:userId - Get user's orders
router.get('/orders/:userId', async (req, res) => {
  try {
    const orders = await listOrders(req.params.userId, 20);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
