import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['farmer', 'enterprise'],
    required: true
  },
  avatar: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  landArea: {
    type: String,
    default: ''
  },
  soilType: {
    type: String,
    enum: ['Clay', 'Sandy', 'Silty', 'Peaty', 'Chalky', 'Loamy', 'Other', ''],
    default: ''
  },
  profileCompleted: {
    type: Boolean,
    default: false
  },
  notifications: {
    emailNotifications: { type: Boolean, default: true },
    weatherAlerts: { type: Boolean, default: true },
    marketPrices: { type: Boolean, default: false }
  },
  resetPasswordOTP: String,
  resetPasswordOTPExpires: Date,
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;