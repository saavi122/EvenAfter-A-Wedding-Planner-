import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  reviewText: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  imageUrl: { type: String, default: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256' }
}, { timestamps: true });

const Testimonial = mongoose.model('Testimonial', testimonialSchema);
export default Testimonial;
