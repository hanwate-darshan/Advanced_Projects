import mongoose from "mongoose";

const adminNotificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  audience: {
    type: String,
    enum: ["all", "customers", "owners", "riders", "specific"],
    default: "all"
  },
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });

const AdminNotification = mongoose.model("AdminNotification", adminNotificationSchema);
export default AdminNotification;
