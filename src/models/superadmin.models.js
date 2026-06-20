import mongoose from 'mongoose';

const superAdmin = new mongoose.Schema({
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
  AdminRole:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"user",
    required:true
  },
  userId:{ // unique id inherited from phone no
    type:mongoose.Schema.Types.ObjectId,
    ref:"user",
    required:true
  },
  createdAt:{
    type:String,
    required:true
  },
  updatedAt:{
    type:String,
    required:true
  },
  lastLogin:{
    type:String,
    required:true
  },
  adminId:{
    type:String,
    unique:true
  }
});

const admin = mongoose.model('admin',superAdmin);
export default admin;
