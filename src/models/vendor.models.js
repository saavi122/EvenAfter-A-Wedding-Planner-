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
  },
  workingAreas:[{
    type:String
  }],
  description:{
    type:String,
    default:""
  },
  profileViews:{
    type:Number,
    default:0
  },
  quoteRequests:{
    type:Number,
    default:0
  },
  bookingRequests:{
    type:Number,
    default:0
  },
  socialLinks:{
    instagram:{ type: String, default: "" },
    facebook:{ type: String, default: "" },
    linkedin:{ type: String, default: "" }
  },
  packages:{
    basic:{
      name:{ type: String, default: "Basic Package" },
      price:{ type: String, default: "" },
      description:{ type: String, default: "" }
    },
    standard:{
      name:{ type: String, default: "Standard Package" },
      price:{ type: String, default: "" },
      description:{ type: String, default: "" }
    },
    premium:{
      name:{ type: String, default: "Premium Package" },
      price:{ type: String, default: "" },
      description:{ type: String, default: "" }
    }
  },
  previousEvents:[{
    name:{ type: String },
    eventType:{ type: String },
    plannerName:{ type: String },
    location:{ type: String },
    date:{ type: Date },
    clientRating:{ type: Number, default: 5 },
    images:[{ type: String }]
  }]
});

const vendor = mongoose.model('vendor',vendorSchema);
export default vendor;
