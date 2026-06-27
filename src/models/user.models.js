import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name:{
    type:String,
    required:true
  },
  email:{
    type:String,
    required:true
  },
  password:{
    type:String,
    required:true
  },
  role:{
    type:String,
    required:true
  },
  phoneNo:{
    type:String,
    required:true
  },
  plan:{
    type:String,
    default:"Free"
  },
  planStartDate:{
    type:Date,
    default:Date.now
  },
  planEndDate:{
    type:Date
  },
  subscriptionStatus:{
    type:String,
    default:"active",
    enum:["active","expired","cancelled"]
  },
  autoRenew:{
    type:Boolean,
    default:true
  }
},{
  timestamps: true
}
);

const user = mongoose.model('user',userSchema);
export default user;

