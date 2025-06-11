import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  month: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true
  },
  jobDescription: {
    type: String,
    trim: true
  },
  eligibilityCriteria: {
    cgpa: {
      type: Number,
      required: true
    },
    backlog: {
      type: Number,
      default: 0
    },
    branches: [{
      type: String,
      required: true
    }]
  },
  ctc: {
    type: Number,
    required: true
  },
  presentationDate: {
    type: Date,
    required: true
  },
  presentationTime: {
    type: String,
    required: true
  },
  oaDate: {
    type: Date,
    required: true
  },
  oaTime: {
    type: String,
    required: true
  },
  interviewDate: {
    type: Date,
    required: true
  },
  interviewTime: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const Company = mongoose.model('Company', companySchema);

export default Company;