import mongoose from "mongoose";
import { type } from "os";

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique:true
    },
    password:{
        type: String,
    },
    mobile:{
        type: String,
        required: true, 
    },
    role: {
        type: String,
        enum: ["user", "owner", "deliveryBoy", "admin"],
        required: true
    },
    approvalStatus: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "approved"
    },
    accountStatus: {
        type: String,
        enum: ["active", "blocked", "suspended", "deactivated"],
        default: "active"
    },
    blockedAt: {
        type: Date
    },
    blockedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    resetOtp:{
        type:String
    },
    isOtpVerified:{
        type:Boolean,
        default:false
    },
    otpExpires:{
        type:Date
    },
    socketId:{
     type:String,
     
    },
    isOnline:{
        type:Boolean,
        default:false
    },
   location:{
type:{type:String,enum:['Point'],default:'Point'},
coordinates:{type:[Number],default:[0,0]}
   }
  
}, { timestamps: true })

userSchema.index({location:'2dsphere'})


const User=mongoose.model("User",userSchema)
export default User