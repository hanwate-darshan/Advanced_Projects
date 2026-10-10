import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  discountType: {
    type: String,
    enum: ["percentage", "fixed"],
    default: "percentage"
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0
  },
  minOrder: {
    type: Number,
    default: 0
  },
  maxDiscount: {
    type: Number,
    default: 0
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: true
  },
  usageLimit: {
    type: Number,
    default: 100
  },
  usedCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;
