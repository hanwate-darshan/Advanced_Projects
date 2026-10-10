import express from "express";
import isAdmin from "../middlewares/isAdmin.js";
import {
  adminLogin,
  adminMe,
  adminLogout,
  getDashboardStats,
  getDashboardCharts,
  getCustomers,
  getCustomerById,
  updateCustomerStatus,
  getOwners,
  getOwnerById,
  updateOwnerApproval,
  updateOwnerStatus,
  getRestaurants,
  getRestaurantById,
  updateRestaurantStatus,
  updateItemStatus,
  getRiders,
  getRiderById,
  updateRiderApproval,
  updateRiderStatus,
  getLiveDeliveries,
  getOrders,
  getOrderById,
  getPayments,
  getRevenueStats,
  getComplaints,
  createComplaint,
  updateComplaintStatus,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getNotifications,
  sendNotification,
  getAnalytics,
  getAiInsights,
  getSettings,
  updateSettings,
  getActivityLogs,
  updateAdminProfile
} from "../controllers/admin.controllers.js";

const adminRouter = express.Router();

// Public Admin Auth
adminRouter.post("/auth/login", adminLogin);

// Protected Admin Routes (Require valid JWT & role === "admin")
adminRouter.use(isAdmin);

adminRouter.get("/auth/me", adminMe);
adminRouter.patch("/auth/profile", updateAdminProfile);
adminRouter.post("/auth/logout", adminLogout);

// Dashboard
adminRouter.get("/dashboard/stats", getDashboardStats);
adminRouter.get("/dashboard/charts", getDashboardCharts);

// Customers
adminRouter.get("/customers", getCustomers);
adminRouter.get("/customers/:id", getCustomerById);
adminRouter.patch("/customers/:id/status", updateCustomerStatus);

// Owners
adminRouter.get("/owners", getOwners);
adminRouter.get("/owners/:id", getOwnerById);
adminRouter.patch("/owners/:id/approval", updateOwnerApproval);
adminRouter.patch("/owners/:id/status", updateOwnerStatus);

// Restaurants & Food Moderation
adminRouter.get("/restaurants", getRestaurants);
adminRouter.get("/restaurants/:id", getRestaurantById);
adminRouter.patch("/restaurants/:id/status", updateRestaurantStatus);
adminRouter.patch("/items/:id/status", updateItemStatus);

// Riders & Live Fleet
adminRouter.get("/riders", getRiders);
adminRouter.get("/riders/:id", getRiderById);
adminRouter.patch("/riders/:id/approval", updateRiderApproval);
adminRouter.patch("/riders/:id/status", updateRiderStatus);
adminRouter.get("/live-deliveries", getLiveDeliveries);

// Orders
adminRouter.get("/orders", getOrders);
adminRouter.get("/orders/:id", getOrderById);

// Payments & Revenue
adminRouter.get("/payments", getPayments);
adminRouter.get("/revenue", getRevenueStats);

// Complaints
adminRouter.get("/complaints", getComplaints);
adminRouter.post("/complaints", createComplaint);
adminRouter.patch("/complaints/:id", updateComplaintStatus);

// Coupons
adminRouter.get("/coupons", getCoupons);
adminRouter.post("/coupons", createCoupon);
adminRouter.patch("/coupons/:id", updateCoupon);
adminRouter.delete("/coupons/:id", deleteCoupon);

// Notifications
adminRouter.get("/notifications", getNotifications);
adminRouter.post("/notifications", sendNotification);

// Analytics & AI Insights
adminRouter.get("/analytics", getAnalytics);
adminRouter.get("/analytics/ai-insights", getAiInsights);

// Settings
adminRouter.get("/settings", getSettings);
adminRouter.put("/settings", updateSettings);

// Activity Logs
adminRouter.get("/activity-logs", getActivityLogs);

export default adminRouter;
