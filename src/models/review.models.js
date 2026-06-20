import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  plannerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'planner',
    required: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'client',
    required: true
  },
  clientName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  text: { type: String, required: true },
  images: [{ type: String }],
  verified: { type: Boolean, default: true }
}, {
  timestamps: true
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
