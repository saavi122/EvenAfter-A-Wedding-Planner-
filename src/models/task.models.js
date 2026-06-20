import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'WeddingEvent', required: true },
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
  dueDate: { type: Date }
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);
export default Task;
