import mongoose from 'mongoose';

const timelineItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' }
});

const budgetItemSchema = new mongoose.Schema({
  category: { type: String, required: true },
  allocated: { type: Number, required: true },
  spent: { type: Number, default: 0 },
  status: { type: String, enum: ['Unallocated', 'Allocated', 'Paid'], default: 'Unallocated' }
});

const weddingEventSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'client', required: true },
  plannerId: { type: mongoose.Schema.Types.ObjectId, ref: 'planner' },
  vendors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'vendor' }],
  title: { type: String, required: true },
  eventType: { type: String, default: 'Wedding' },
  date: { type: Date },
  venue: { type: String },
  location: { type: String, default: '' },
  budget: { type: Number, default: 0 },
  guestCount: { type: Number, default: 0 },
  progress: { type: Number, default: 0 }, // percentage 0 - 100
  timeline: [timelineItemSchema],
  budgetItems: [budgetItemSchema],
  status: { type: String, enum: ['Planning', 'Ongoing', 'Completed'], default: 'Planning' }
}, { timestamps: true });

const WeddingEvent = mongoose.model('WeddingEvent', weddingEventSchema);
export default WeddingEvent;
