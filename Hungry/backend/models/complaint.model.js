import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order"
  },
  category: {
    type: String,
    enum: [
      "Food Quality",
      "Wrong Order",
      "Late Delivery",
      "Payment Problem",
      "Restaurant Issue",
      "Rider Issue",
      "Refund Issue",
      "Other"
    ],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "urgent"],
    default: "medium"
  },
  status: {
    type: String,
    enum: ["pending", "in progress", "resolved", "rejected"],
    default: "pending"
  },
  adminNotes: {
    type: String,
    default: ""
  },
  resolvedAt: {
    type: Date
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });

const Complaint = mongoose.model("Complaint", complaintSchema);
export default Complaint;
