import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
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
  date: { type: Date, required: true },
  time: { type: String, required: true },
  agenda: { type: String, required: true },
  meetingType: {
    type: String,
    enum: ['Google Meet', 'Zoom', 'Internal Video Call'],
    required: true
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  },
  link: { type: String }
}, {
  timestamps: true
});

const Meeting = mongoose.model('Meeting', meetingSchema);
export default Meeting;
