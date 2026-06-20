import mongoose from 'mongoose';

const vendorAssignmentSchema = new mongoose.Schema({
  plannerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'planner',
    required: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'vendor',
    required: true
  },
  weddingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'client', // Selects client's wedding event
    required: true
  },
  role: {
    type: String, // Services/Role like Floral Decor, Catering, Photography
    required: true
  },
  budget: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected', 'Completed'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

const VendorAssignment = mongoose.model('VendorAssignment', vendorAssignmentSchema);
export default VendorAssignment;
