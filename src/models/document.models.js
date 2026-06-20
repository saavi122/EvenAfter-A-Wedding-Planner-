import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'WeddingEvent' },
  name: { type: String, required: true },
  type: { type: String, required: true },
  size: { type: Number, required: true },
  url: { type: String, default: '#' },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true }
}, { timestamps: true });

const Document = mongoose.model('Document', documentSchema);
export default Document;
