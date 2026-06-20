import mongoose from 'mongoose';

const plannerRequestSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'client',
    required: true
  },
  plannerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'planner',
    required: true
  },
  weddingType: { type: String, required: true },
  weddingDate: { type: Date, required: true },
  location: { type: String, required: true },
  budget: { type: Number, required: true },
  requirements: { type: String },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected', 'In Discussion'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

const PlannerRequest = mongoose.model('PlannerRequest', plannerRequestSchema);
export default PlannerRequest;
