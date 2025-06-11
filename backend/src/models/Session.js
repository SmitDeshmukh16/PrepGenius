import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  dateTime: {
    type: Date,
    required: true
  },
  meetLink: {
    type: String,
    required: true,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['Upcoming', 'Past'],
    default: 'Upcoming'
  }
}, {
  timestamps: true
});

// Middleware to check and update session status
sessionSchema.pre('save', function(next) {
  if (this.dateTime < new Date()) {
    this.isActive = false;
    this.status = 'Past';
  } else {
    this.status = 'Upcoming';
  }
  next();
});

const Session = mongoose.model('Session', sessionSchema);

export default Session;