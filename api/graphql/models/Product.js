import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  verified: { type: Boolean, default: false },
  description: { type: String, required: true },
  icon: { type: String, default: '📦' },
  thumbnail: { type: String },
  preview: { type: String },
  rating: { type: Number, default: 0 },
  sales: { type: Number, default: 0 },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
