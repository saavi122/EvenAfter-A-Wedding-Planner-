import mongoose from 'mongoose';

const eventHistorySchema = new mongoose.Schema({
  plannerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'planner',
    required: true
  },
  name: { type: String, required: true },
  venue: { type: String, required: true },
  date: { type: Date, required: true },
  guestCount: { type: Number, required: true },
  budget: { type: Number, required: true },
  status: { type: String, default: 'Completed' },
  role: { type: String, default: 'Lead Planner' },
  gallery: [{ type: String }],
  rating: { type: Number, default: 5 }
}, {
  timestamps: true
});

const EventHistory = mongoose.model('EventHistory', eventHistorySchema);
export default EventHistory;
