import mongoose from 'mongoose';
import Product from './models/Product.js';

const products = [
  {
    name: 'React Component Pack',
    price: 29,
    category: 'code',
    verified: true,
    description: 'Professional React components',
    icon: '💻',
    thumbnail:
      'https://via.placeholder.com/400x300/0a0a0f/00ff00?text=React+Components',
    preview: 'https://via.placeholder.com/800x600/0a0a0f/00ff00?text=React+Preview',
    rating: 4.8,
    sales: 342,
  },
  {
    name: 'UI Design System',
    price: 49,
    category: 'design',
    verified: true,
    description: 'Complete design system',
    icon: '🎨',
    thumbnail: 'https://via.placeholder.com/400x300/0a0a0f/00ffff?text=Design+System',
    preview: 'https://via.placeholder.com/800x600/0a0a0f/00ffff?text=Design+Preview',
    rating: 4.9,
    sales: 567,
  },
  {
    name: 'API Integration Kit',
    price: 39,
    category: 'code',
    verified: false,
    description: 'REST & GraphQL APIs',
    icon: '🔌',
    thumbnail: 'https://via.placeholder.com/400x300/0a0a0f/ff00ff?text=API+Kit',
    preview: 'https://via.placeholder.com/800x600/0a0a0f/ff00ff?text=API+Preview',
    rating: 4.5,
    sales: 234,
  },
  {
    name: 'Landing Page Template',
    price: 19,
    category: 'templates',
    verified: true,
    description: 'Modern landing pages',
    icon: '📄',
    thumbnail: 'https://via.placeholder.com/400x300/0a0a0f/00ff00?text=Landing+Page',
    preview: 'https://via.placeholder.com/800x600/0a0a0f/00ff00?text=Landing+Preview',
    rating: 4.7,
    sales: 789,
  },
  {
    name: 'Analytics Dashboard',
    price: 59,
    category: 'code',
    verified: true,
    description: 'Real-time analytics',
    icon: '📊',
    thumbnail: 'https://via.placeholder.com/400x300/0a0a0f/00ffff?text=Analytics',
    preview: 'https://via.placeholder.com/800x600/0a0a0f/00ffff?text=Analytics+Preview',
    rating: 4.9,
    sales: 456,
  },
  {
    name: 'Icon Pack Pro',
    price: 15,
    category: 'design',
    verified: true,
    description: '500+ premium icons',
    icon: '⭐',
    thumbnail: 'https://via.placeholder.com/400x300/0a0a0f/ffff00?text=Icon+Pack',
    preview: 'https://via.placeholder.com/800x600/0a0a0f/ffff00?text=Icons+Preview',
    rating: 4.6,
    sales: 1234,
  },
  {
    name: 'Auth Plugin',
    price: 25,
    category: 'plugins',
    verified: false,
    description: 'Authentication system',
    icon: '🔐',
    thumbnail: 'https://via.placeholder.com/400x300/0a0a0f/ff00ff?text=Auth+Plugin',
    preview: 'https://via.placeholder.com/800x600/0a0a0f/ff00ff?text=Auth+Preview',
    rating: 4.4,
    sales: 123,
  },
  {
    name: 'E-commerce Template',
    price: 79,
    category: 'templates',
    verified: true,
    description: 'Full e-commerce solution',
    icon: '🛒',
    thumbnail: 'https://via.placeholder.com/400x300/0a0a0f/00ff00?text=E-commerce',
    preview: 'https://via.placeholder.com/800x600/0a0a0f/00ff00?text=Shop+Preview',
    rating: 4.8,
    sales: 345,
  },
  {
    name: 'Payment Gateway Plugin',
    price: 45,
    category: 'plugins',
    verified: true,
    description: 'Stripe & PayPal integration',
    icon: '💳',
    thumbnail: 'https://via.placeholder.com/400x300/0a0a0f/00ffff?text=Payment+Gateway',
    preview: 'https://via.placeholder.com/800x600/0a0a0f/00ffff?text=Payment+Preview',
    rating: 4.7,
    sales: 678,
  },
];

async function seed() {
  try {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot run seed script in production');
    }
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/hootner'
    );
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log('✅ Database seeded with products');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
}

seed();
