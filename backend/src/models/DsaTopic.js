import mongoose from 'mongoose';

const dsaQuestionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  link: {
    type: String,
    required: true,
    trim: true
  },
  platform: {
    type: String,
    required: true,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const dsaTopicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  questions: [dsaQuestionSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const DsaTopic = mongoose.model('DsaTopic', dsaTopicSchema);

export default DsaTopic;