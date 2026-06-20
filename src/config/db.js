import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import User from "../models/user.models.js";
import bcrypt from "bcryptjs";

const connectDB = async () =>{
    try{
        const connection = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
        console.log(`MongoDB connected: ${connection.connection.host}`);
        
        // Auto-seed admin credentials if they do not exist
        const adminEmail = "admin@vendornet.com";
        const adminExists = await User.findOne({ email: adminEmail });
        if (!adminExists) {
            console.log("Super Admin not found. Seeding admin user...");
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash("adminSecretPassword", salt);
            await User.create({
                name: "Super Admin",
                email: adminEmail,
                password: hashedPassword,
                role: "superadmin",
                phoneNo: "9999999999"
            });
            console.log("Super Admin seeded successfully.");
        }
    }
    catch(err){
        console.log("connection failed", err);
    }
}
export default connectDB;
