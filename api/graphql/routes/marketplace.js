import express from 'express';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Stripe from 'stripe';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

router.get('/products', async (req, res) => {
  try {
    const { category, search, sort, page = 1, limit = 9 } = req.query;
    let query = { active: true };
    
    if (category && category !== 'all') query.category = category;
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
    
    let sortObj = {};
    if (sort === 'price-low') sortObj.price = 1;
    else if (sort === 'price-high') sortObj.price = -1;
    else if (sort === 'name') sortObj.name = 1;
    
    const skip = (page - 1) * limit;
    const products = await Product.find(query).sort(sortObj).skip(skip).limit(parseInt(limit));
    const total = await Product.countDocuments(query);
    
    res.json({ products, hasMore: skip + products.length < total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/checkout', async (req, res) => {
  try {
    const { items, userId } = req.body;
    
    const order = new Order({
      userId,
      items,
      total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      status: 'pending'
    });
    await order.save();
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: { name: item.name },
          unit_amount: item.price * 100
        },
        quantity: item.quantity
      })),
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/marketplace?success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/marketplace?canceled=true`,
      metadata: { orderId: order._id.toString() }
    });
    
    order.stripeSessionId = session.id;
    await order.save();
    
    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/orders/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .populate('items.productId')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/contact-seller', async (req, res) => {
  try {
    const { productId, email } = req.body;
    const product = await Product.findById(productId);
    
    // TODO: Send email to seller
    console.log(`📧 Message from ${email} about ${product.name}`);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
