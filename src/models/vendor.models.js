import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema({
  name:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"user",
    required:true
  },
  email:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"user",
    required:true
  },
  VendorRole:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"user",
    required:true
  },
  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"user",
    required:true
  },
  businessName:{
    type:String,
    required:false
  },
  vendorType:{
    type:String,
    required:false
  },
  assignedEvents:{
    type:String,
    required:false,
    default:"0"
  }, 
  vendorId:{
    type:String,
    unique:true
  },
  status:{
    type:String,
    required:false,
    default:"active"
  },
  rating:{
    type:String,
    required:false,
    default:"5.0"
  },
  vendorLogo:{
    type:String,
    default:"https://images.unsplash.com/photo-1546032994-380cc0ed78b4?q=80&w=256"
  },
  coverImage:{
    type:String,
    default:"https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=1200"
  },
  experience:{
    type:String,
    default:"3 Years"
  },
  location:{
    type:String,
    default:"Goa"
  },
  availabilityStatus:{
    type:String,
    enum:['Available', 'Busy', 'Booked', 'Offline', 'Vacation'],
    default:"Available"
  },
  responseTime:{
    type:String,
    default:"within 1 hour"
  },
  completedEvents:{
    type:Number,
    default:0
  },
  servicesOffered:[{
    type:String
  }],
  priceRange:{
    type:String,
    default:"50,000 - 2,000,000 INR"
  },
  portfolio:[{
    type:String
  }],
  contactDetails:{
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    address: { type: String, default: "" }
  }
});

const vendor = mongoose.model('vendor',vendorSchema);
export default vendor;
