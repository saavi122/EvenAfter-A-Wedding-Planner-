import mongoose from 'mongoose';

const shortlistedVendorSchema = new mongoose.Schema({
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
  eventId: {
    type: String, // Wedding / Event identifier
    default: ""
  },
  status: {
    type: String,
    enum: ['Shortlisted', 'Contacted', 'In Discussion'],
    default: 'Shortlisted'
  }
}, {
  timestamps: true
});

const ShortlistedVendor = mongoose.model('ShortlistedVendor', shortlistedVendorSchema);
export default ShortlistedVendor;
