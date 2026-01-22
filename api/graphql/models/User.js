const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  avatar: String,
  subscription: {
    type: String,
    enum: ['FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE'],
    default: 'FREE'
  },
  role: {
    type: String,
    enum: ['USER', 'CREATOR', 'MODERATOR', 'ADMIN'],
    default: 'USER'
  }
}, { timestamps: true });

userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
