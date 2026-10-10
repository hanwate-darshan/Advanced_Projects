import mongoose from "mongoose";

const platformSettingSchema = new mongoose.Schema({
  deliveryRadiusKm: {
    type: Number,
    default: 5,
    min: 1,
    max: 50
  },
  deliveryFee: {
    type: Number,
    default: 40,
    min: 0
  },
  platformCommissionPercent: {
    type: Number,
    default: 10,
    min: 0,
    max: 100
  },
  minOrderAmount: {
    type: Number,
    default: 50,
    min: 0
  },
  maxCodAmount: {
    type: Number,
    default: 2000,
    min: 0
  },
  otpExpiryMinutes: {
    type: Number,
    default: 5,
    min: 1
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const PlatformSetting = mongoose.model("PlatformSetting", platformSettingSchema);
export default PlatformSetting;
