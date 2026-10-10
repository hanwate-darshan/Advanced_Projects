import mongoose from "mongoose";

const adminActivitySchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  action: {
    type: String,
    required: true
  },
  targetType: {
    type: String,
    enum: ["User", "Owner", "Rider", "Shop", "Item", "Order", "Complaint", "Coupon", "Setting", "Notification", "Other"],
    default: "Other"
  },
  targetId: {
    type: String
  },
  description: {
    type: String,
    required: true
  },
  ip: {
    type: String,
    default: ""
  }
}, { timestamps: true });

const AdminActivity = mongoose.model("AdminActivity", adminActivitySchema);
export default AdminActivity;
