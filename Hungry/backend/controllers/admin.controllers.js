import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/user.model.js";
import Shop from "../models/shop.model.js";
import Item from "../models/item.model.js";
import Order from "../models/order.model.js";
import DeliveryAssignment from "../models/deliveryAssignment.model.js";
import AdminActivity from "../models/adminActivity.model.js";
import Complaint from "../models/complaint.model.js";
import Coupon from "../models/coupon.model.js";
import AdminNotification from "../models/adminNotification.model.js";
import PlatformSetting from "../models/platformSetting.model.js";
import { aiChat } from "../utils/ai.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

// Helper: Log Admin Activity
const logActivity = async (adminId, action, targetType, targetId, description, req) => {
  try {
    const ip = req?.headers?.["x-forwarded-for"] || req?.socket?.remoteAddress || "";
    await AdminActivity.create({
      admin: adminId,
      action,
      targetType,
      targetId: targetId ? String(targetId) : "",
      description,
      ip: String(ip)
    });
  } catch (error) {
    console.error("logActivity error:", error);
  }
};

// Helper: Ensure Default Platform Setting Exists
export const getPlatformSettingsHelper = async () => {
  let settings = await PlatformSetting.findOne();
  if (!settings) {
    settings = await PlatformSetting.create({
      deliveryRadiusKm: 5,
      deliveryFee: 40,
      platformCommissionPercent: 10,
      minOrderAmount: 50,
      maxCodAmount: 2000,
      otpExpiryMinutes: 5,
      maintenanceMode: false
    });
  }
  return settings;
};

// Auto-seed or Sync Admin from Environment (.env)
export const seedAdmin = async () => {
  try {
    dotenv.config(); // Reload fresh values from .env without requiring server restart
    const adminEmail = (process.env.ADMIN_EMAIL || "admin@hungry.com").toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const adminFullName = process.env.ADMIN_FULLNAME || "Hungry SuperAdmin";
    const adminMobile = process.env.ADMIN_MOBILE || "9999999999";

    let admin = await User.findOne({ role: "admin" });
    if (!admin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      admin = await User.create({
        fullName: adminFullName,
        email: adminEmail,
        password: hashedPassword,
        mobile: adminMobile,
        role: "admin",
        approvalStatus: "approved",
        accountStatus: "active"
      });
      console.log(`[Admin] Initialized admin user from environment: ${adminEmail}`);
    } else {
      // Auto-sync if .env credentials were updated by the user
      const isEmailSame = admin.email.toLowerCase() === adminEmail;
      const isPasswordSame = await bcrypt.compare(adminPassword, admin.password);

      if (!isEmailSame || !isPasswordSame) {
        admin.email = adminEmail;
        admin.password = await bcrypt.hash(adminPassword, 10);
        if (adminFullName) admin.fullName = adminFullName;
        if (adminMobile) admin.mobile = adminMobile;
        await admin.save();
        console.log(`[Admin] Credentials updated & synced from .env: ${adminEmail}`);
      }
    }
    return admin;
  } catch (err) {
    console.error("seedAdmin error:", err);
  }
};

// --------------------------------------------------------------------------
// 1. AUTHENTICATION
// --------------------------------------------------------------------------

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    // Auto-seed if first time
    await seedAdmin();

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied. Admin role required" });
    }

    if (user.accountStatus === "blocked" || user.accountStatus === "suspended") {
      return res.status(403).json({ success: false, message: "Account is blocked or suspended" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    await logActivity(user._id, "ADMIN_LOGIN", "User", user._id, "Admin logged into dashboard", req);

    const safeUser = user.toObject();
    delete safeUser.password;

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      data: safeUser,
      token
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Login error: ${error.message}` });
  }
};

export const adminMe = async (req, res) => {
  try {
    const admin = await User.findById(req.userId).select("-password");
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }
    return res.status(200).json({ success: true, data: admin });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAdminProfile = async (req, res) => {
  try {
    const { fullName, email, mobile, password } = req.body;
    const admin = await User.findById(req.userId);
    if (!admin || admin.role !== "admin") {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    if (email && email.toLowerCase() !== admin.email.toLowerCase()) {
      const existing = await User.findOne({ email: email.toLowerCase(), _id: { $ne: admin._id } });
      if (existing) {
        return res.status(400).json({ success: false, message: "Email is already in use by another user" });
      }
      admin.email = email.toLowerCase().trim();
    }

    if (fullName && fullName.trim()) admin.fullName = fullName.trim();
    if (mobile && mobile.trim()) admin.mobile = mobile.trim();

    if (password && password.trim()) {
      if (password.trim().length < 6) {
        return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
      }
      admin.password = await bcrypt.hash(password.trim(), 10);
    }

    await admin.save();
    await logActivity(admin._id, "ADMIN_PROFILE_UPDATE", "User", admin._id, "Admin updated credentials (name, email, mobile, password)", req);

    const safeAdmin = admin.toObject();
    delete safeAdmin.password;

    return res.status(200).json({
      success: true,
      message: "Admin credentials updated successfully!",
      data: safeAdmin
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Profile update error: ${error.message}` });
  }
};

export const adminLogout = async (req, res) => {
  try {
    if (req.userId) {
      await logActivity(req.userId, "ADMIN_LOGOUT", "User", req.userId, "Admin logged out", req);
    }
    res.clearCookie("token");
    return res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --------------------------------------------------------------------------
// 2. DASHBOARD KPI & CHARTS
// --------------------------------------------------------------------------

export const getDashboardStats = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalCustomers,
      totalOwners,
      totalRestaurants,
      totalRiders,
      totalOrders,
      onlineRiders,
      activeDeliveries,
      pendingOwners,
      pendingRiders,
      pendingComplaints
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "owner" }),
      Shop.countDocuments(),
      User.countDocuments({ role: "deliveryBoy" }),
      Order.countDocuments(),
      User.countDocuments({ role: "deliveryBoy", isOnline: true }),
      DeliveryAssignment.countDocuments({ status: "assigned" }),
      User.countDocuments({ role: "owner", approvalStatus: "pending" }),
      User.countDocuments({ role: "deliveryBoy", approvalStatus: "pending" }),
      Complaint.countDocuments({ status: "pending" })
    ]);

    // Total revenue aggregation (all paid orders or COD delivered)
    const revenueAgg = await Order.aggregate([
      {
        $match: {
          $or: [
            { payment: true },
            { paymentMethod: "cod", "shopOrders.status": "delivered" }
          ]
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" }
        }
      }
    ]);
    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

    // Today's statistics
    const todayOrdersAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: todayStart } } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ["$payment", true] },
                    { $eq: ["$paymentMethod", "cod"] }
                  ]
                },
                "$totalAmount",
                0
              ]
            }
          }
        }
      }
    ]);

    const todayOrdersCount = todayOrdersAgg[0]?.count || 0;
    const todayRevenue = todayOrdersAgg[0]?.revenue || 0;

    const [
      todayCustomers,
      todayOwners,
      todayRiders,
      todayDelivered,
      failedPayments,
      pendingOrders,
      orderTrend,
      statusDistribution,
      recentOrders
    ] = await Promise.all([
      User.countDocuments({ role: "user", createdAt: { $gte: todayStart } }),
      User.countDocuments({ role: "owner", createdAt: { $gte: todayStart } }),
      User.countDocuments({ role: "deliveryBoy", createdAt: { $gte: todayStart } }),
      Order.countDocuments({ "shopOrders.status": "delivered", updatedAt: { $gte: todayStart } }),
      Order.countDocuments({ paymentMethod: "online", payment: false }),
      Order.countDocuments({ "shopOrders.status": "pending" }),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            orders: { $sum: 1 },
            sales: { $sum: "$totalAmount" }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Order.aggregate([
        { $unwind: "$shopOrders" },
        {
          $group: {
            _id: "$shopOrders.status",
            count: { $sum: 1 }
          }
        }
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .populate("user", "fullName email mobile")
        .populate("shopOrders.shop", "name city")
        .populate("shopOrders.assignedDeliveryBoy", "fullName mobile")
    ]);

    return res.status(200).json({
      success: true,
      data: {
        counts: {
          customers: totalCustomers,
          owners: totalOwners,
          shops: totalRestaurants,
          riders: totalRiders,
          totalOrders: totalOrders,
          activeOrders: activeDeliveries,
          onlineRiders
        },
        revenue: {
          totalGmv: totalRevenue,
          platformNet: Math.round(totalRevenue * 0.15)
        },
        pending: {
          restaurantOwners: pendingOwners,
          deliveryRiders: pendingRiders,
          complaints: pendingComplaints,
          orders: pendingOrders
        },
        orderTrend,
        statusDistribution,
        recentOrders,
        kpis: {
          totalCustomers,
          totalOwners,
          totalRestaurants,
          totalRiders,
          totalOrders,
          totalRevenue,
          activeDeliveries,
          onlineRiders
        },
        today: {
          orders: todayOrdersCount,
          revenue: todayRevenue,
          customers: todayCustomers,
          owners: todayOwners,
          riders: todayRiders,
          completedDeliveries: todayDelivered
        },
        pendingActions: {
          pendingOwners,
          pendingRiders,
          pendingComplaints,
          pendingOrders,
          failedPayments
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getDashboardCharts = async (req, res) => {
  try {
    const { timeframe = "7days" } = req.query;
    let days = 7;
    if (timeframe === "30days") days = 30;
    if (timeframe === "today") days = 1;
    if (timeframe === "12months") days = 365;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Orders & Revenue trend by date
    const trendAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: days <= 30 ? "%Y-%m-%d" : "%Y-%m", date: "$createdAt" }
          },
          orders: { $sum: 1 },
          revenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Status distribution
    const statusAgg = await Order.aggregate([
      { $unwind: "$shopOrders" },
      {
        $group: {
          _id: "$shopOrders.status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Payment distribution
    const paymentAgg = await Order.aggregate([
      {
        $group: {
          _id: {
            method: "$paymentMethod",
            isPaid: "$payment"
          },
          count: { $sum: 1 },
          amount: { $sum: "$totalAmount" }
        }
      }
    ]);

    // User growth trend
    const userGrowthAgg = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            role: "$role"
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.date": 1 } }
    ]);

    // Format user growth
    const growthMap = {};
    userGrowthAgg.forEach(item => {
      const d = item._id.date;
      if (!growthMap[d]) growthMap[d] = { date: d, customers: 0, owners: 0, riders: 0 };
      if (item._id.role === "user") growthMap[d].customers = item.count;
      if (item._id.role === "owner") growthMap[d].owners = item.count;
      if (item._id.role === "deliveryBoy") growthMap[d].riders = item.count;
    });

    return res.status(200).json({
      success: true,
      data: {
        trend: trendAgg.map(t => ({ date: t._id, orders: t.orders, revenue: t.revenue })),
        statusDistribution: statusAgg.map(s => ({ status: s._id || "pending", count: s.count })),
        paymentDistribution: paymentAgg.map(p => ({
          label: `${p._id.method?.toUpperCase()} (${p._id.isPaid ? 'Paid' : 'Pending'})`,
          method: p._id.method,
          isPaid: p._id.isPaid,
          count: p.count,
          amount: p.amount
        })),
        userGrowth: Object.values(growthMap)
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --------------------------------------------------------------------------
// 3. CUSTOMER MANAGEMENT
// --------------------------------------------------------------------------

export const getCustomers = async (req, res) => {
  try {
    const { search = "", status, page = 1, limit = 20, sort = "newest" } = req.query;

    const query = { role: "user" };

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } }
      ];
    }

    if (status && status !== "all") {
      query.accountStatus = status;
    }

    let sortOptions = { createdAt: -1 };
    if (sort === "oldest") sortOptions = { createdAt: 1 };
    if (sort === "name") sortOptions = { fullName: 1 };

    const skip = (Number(page) - 1) * Number(limit);

    const [customers, total] = await Promise.all([
      User.find(query).sort(sortOptions).skip(skip).limit(Number(limit)).select("-password"),
      User.countDocuments(query)
    ]);

    // Attach order summary for each customer
    const userIds = customers.map(c => c._id);
    const orderStats = await Order.aggregate([
      { $match: { user: { $in: userIds } } },
      {
        $group: {
          _id: "$user",
          orderCount: { $sum: 1 },
          totalSpent: { $sum: "$totalAmount" }
        }
      }
    ]);

    const statsMap = {};
    orderStats.forEach(s => {
      statsMap[String(s._id)] = s;
    });

    const enriched = customers.map(c => {
      const stats = statsMap[String(c._id)] || { orderCount: 0, totalSpent: 0 };
      return {
        ...c.toObject(),
        orderCount: stats.orderCount,
        totalSpent: stats.totalSpent
      };
    });

    return res.status(200).json({
      success: true,
      data: enriched,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await User.findById(id).select("-password");
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    const orders = await Order.find({ user: id })
      .sort({ createdAt: -1 })
      .populate("shopOrders.shop", "name image")
      .limit(20);

    const complaints = await Complaint.find({ user: id }).sort({ createdAt: -1 });

    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.shopOrders?.some(so => so.status === "delivered")).length;
    const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const avgOrderValue = totalOrders > 0 ? Math.round(totalSpent / totalOrders) : 0;

    return res.status(200).json({
      success: true,
      data: {
        profile: customer,
        stats: {
          totalOrders,
          completedOrders,
          totalSpent,
          avgOrderValue
        },
        orders,
        complaints
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCustomerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { accountStatus, reason = "" } = req.body;

    if (!["active", "blocked", "suspended", "deactivated"].includes(accountStatus)) {
      return res.status(400).json({ success: false, message: "Invalid account status" });
    }

    const customer = await User.findByIdAndUpdate(
      id,
      {
        accountStatus,
        blockedAt: accountStatus === "blocked" ? new Date() : null,
        blockedBy: accountStatus === "blocked" ? req.userId : null
      },
      { new: true }
    ).select("-password");

    await logActivity(
      req.userId,
      `CUSTOMER_${accountStatus.toUpperCase()}`,
      "User",
      id,
      `Customer ${customer.fullName} set to ${accountStatus}. Reason: ${reason || 'N/A'}`,
      req
    );

    return res.status(200).json({ success: true, message: `Customer marked as ${accountStatus}`, data: customer });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --------------------------------------------------------------------------
// 4. RESTAURANT OWNER MANAGEMENT
// --------------------------------------------------------------------------

export const getOwners = async (req, res) => {
  try {
    const { search = "", approvalStatus, accountStatus, page = 1, limit = 20 } = req.query;

    const query = { role: "owner" };

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } }
      ];
    }

    if (approvalStatus && approvalStatus !== "all") {
      query.approvalStatus = approvalStatus;
    }

    if (accountStatus && accountStatus !== "all") {
      query.accountStatus = accountStatus;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [owners, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).select("-password"),
      User.countDocuments(query)
    ]);

    const ownerIds = owners.map(o => o._id);
    const shops = await Shop.find({ owner: { $in: ownerIds } });
    const shopMap = {};
    shops.forEach(s => {
      shopMap[String(s.owner)] = s;
    });

    const enriched = owners.map(o => ({
      ...o.toObject(),
      shop: shopMap[String(o._id)] || null
    }));

    return res.status(200).json({
      success: true,
      data: {
        owners: enriched,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit))
        }
      },
      owners: enriched,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getOwnerById = async (req, res) => {
  try {
    const { id } = req.params;
    const owner = await User.findById(id).select("-password");
    if (!owner) return res.status(404).json({ success: false, message: "Owner not found" });

    const shop = await Shop.findOne({ owner: id }).populate("items");
    const orders = await Order.find({ "shopOrders.owner": id }).sort({ createdAt: -1 }).limit(20);

    const totalOrders = orders.length;
    const revenue = orders.reduce((sum, o) => {
      const so = o.shopOrders?.find(s => String(s.owner) === String(id));
      return sum + (so?.subtotal || 0);
    }, 0);

    return res.status(200).json({
      success: true,
      data: {
        profile: owner,
        shop,
        stats: {
          totalOrders,
          revenue,
          menuItemsCount: shop?.items?.length || 0
        },
        recentOrders: orders
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOwnerApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const approvalStatus = req.body.approvalStatus || req.body.action;
    const reason = req.body.reason || "";

    if (!["approved", "rejected", "pending"].includes(approvalStatus)) {
      return res.status(400).json({ success: false, message: "Invalid approval status" });
    }

    const owner = await User.findByIdAndUpdate(id, { approvalStatus }, { new: true }).select("-password");
    if (!owner) return res.status(404).json({ success: false, message: "Owner not found" });

    // If owner approved/rejected, update shop status accordingly
    if (approvalStatus === "approved") {
      await Shop.findOneAndUpdate({ owner: id }, { status: "active" });
    } else if (approvalStatus === "rejected") {
      await Shop.findOneAndUpdate({ owner: id }, { status: "suspended" });
    }

    await logActivity(
      req.userId,
      `OWNER_${approvalStatus.toUpperCase()}`,
      "Owner",
      id,
      `Owner ${owner.fullName} approval set to ${approvalStatus}. Note: ${reason || 'N/A'}`,
      req
    );

    return res.status(200).json({
      success: true,
      message: `Owner approval updated to ${approvalStatus}`,
      data: owner
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOwnerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { accountStatus, reason = "" } = req.body;

    const owner = await User.findByIdAndUpdate(id, { accountStatus }, { new: true }).select("-password");
    if (!owner) return res.status(404).json({ success: false, message: "Owner not found" });

    await logActivity(
      req.userId,
      `OWNER_${accountStatus.toUpperCase()}`,
      "Owner",
      id,
      `Owner ${owner.fullName} status set to ${accountStatus}. Note: ${reason || 'N/A'}`,
      req
    );

    return res.status(200).json({ success: true, message: `Owner status updated to ${accountStatus}`, data: owner });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --------------------------------------------------------------------------
// 5. RESTAURANTS & MENU MODERATION
// --------------------------------------------------------------------------

export const getRestaurants = async (req, res) => {
  try {
    const { search = "", city, status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    if (city && city !== "all") {
      query.city = { $regex: city, $options: "i" };
    }
    if (status && status !== "all") {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [shops, total] = await Promise.all([
      Shop.find(query).populate("owner", "fullName email mobile approvalStatus").skip(skip).limit(Number(limit)),
      Shop.countDocuments(query)
    ]);

    return res.status(200).json({
      success: true,
      data: {
        restaurants: shops,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit))
        }
      },
      restaurants: shops,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;
    const shop = await Shop.findById(id).populate("owner", "-password").populate("items");
    if (!shop) return res.status(404).json({ success: false, message: "Restaurant not found" });

    const orders = await Order.find({ "shopOrders.shop": id }).sort({ createdAt: -1 }).limit(20);
    const totalOrders = orders.length;
    const revenue = orders.reduce((sum, o) => {
      const so = o.shopOrders?.find(s => String(s.shop) === String(id));
      return sum + (so?.subtotal || 0);
    }, 0);

    return res.status(200).json({
      success: true,
      data: {
        shop,
        stats: {
          totalOrders,
          revenue,
          menuCount: shop.items?.length || 0
        },
        orders
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getRestaurantItems = async (req, res) => {
  try {
    const { id } = req.params;
    const items = await Item.find({ shop: id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: items, items });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addRestaurantItem = async (req, res) => {
  try {
    const { id } = req.params; // shopId
    const { name, category, price, foodType, description } = req.body;
    let image = req.body.image || "";
    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }

    if (!name || !category || !price) {
      return res.status(400).json({ success: false, message: "Name, category, and price are required" });
    }

    const item = await Item.create({
      name,
      category,
      price: Number(price),
      foodType: foodType || "veg",
      description: description || "",
      image: image || "",
      shop: id,
      isAvailable: true,
      isApproved: true
    });

    const shop = await Shop.findById(id);
    if (shop) {
      shop.items.push(item._id);
      await shop.save();
    }

    await logActivity(
      req.userId,
      "ITEM_CREATED",
      "Item",
      item._id,
      `Admin added item ${item.name} to shop ${shop?.name || id}`,
      req
    );

    return res.status(201).json({ success: true, message: "Item added successfully", data: item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteRestaurantItem = async (req, res) => {
  try {
    const { id } = req.params; // itemId
    const item = await Item.findByIdAndDelete(id);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    await Shop.findByIdAndUpdate(item.shop, { $pull: { items: item._id } });

    await logActivity(
      req.userId,
      "ITEM_DELETED",
      "Item",
      id,
      `Admin deleted item ${item.name}`,
      req
    );

    return res.status(200).json({ success: true, message: "Item deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRestaurantCommission = async (req, res) => {
  try {
    const { id } = req.params;
    const { commissionRate } = req.body;
    const shop = await Shop.findByIdAndUpdate(id, { commissionRate: Number(commissionRate) }, { new: true });
    if (!shop) return res.status(404).json({ success: false, message: "Restaurant not found" });

    return res.status(200).json({ success: true, message: "Commission updated", data: shop });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRestaurantStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason = "" } = req.body;

    const shop = await Shop.findByIdAndUpdate(id, { status }, { new: true });
    if (!shop) return res.status(404).json({ success: false, message: "Restaurant not found" });

    await logActivity(
      req.userId,
      `RESTAURANT_${status.toUpperCase()}`,
      "Shop",
      id,
      `Restaurant ${shop.name} status updated to ${status}. Reason: ${reason || 'N/A'}`,
      req
    );

    return res.status(200).json({ success: true, message: `Restaurant status updated to ${status}`, data: shop });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateItemStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isAvailable, isApproved } = req.body;

    const update = {};
    if (typeof isAvailable === "boolean") update.isAvailable = isAvailable;
    if (typeof isApproved === "boolean") update.isApproved = isApproved;

    const item = await Item.findByIdAndUpdate(id, update, { new: true });
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    await logActivity(
      req.userId,
      "ITEM_MODERATED",
      "Item",
      id,
      `Item ${item.name} moderation updated: ${JSON.stringify(update)}`,
      req
    );

    return res.status(200).json({ success: true, message: "Item status updated", data: item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --------------------------------------------------------------------------
// 6. DELIVERY RIDERS & LIVE TRACKING
// --------------------------------------------------------------------------

export const getRiders = async (req, res) => {
  try {
    const { search = "", approvalStatus, accountStatus, isOnline, page = 1, limit = 20 } = req.query;

    const query = { role: "deliveryBoy" };

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } }
      ];
    }

    if (approvalStatus && approvalStatus !== "all") query.approvalStatus = approvalStatus;
    if (accountStatus && accountStatus !== "all") query.accountStatus = accountStatus;
    if (typeof isOnline === "string" && isOnline !== "all") query.isOnline = isOnline === "true";

    const skip = (Number(page) - 1) * Number(limit);

    const [riders, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).select("-password"),
      User.countDocuments(query)
    ]);

    // Active assignment check
    const riderIds = riders.map(r => r._id);
    const activeAssignments = await DeliveryAssignment.find({
      assignedTo: { $in: riderIds },
      status: "assigned"
    }).populate("shop", "name");

    const assignMap = {};
    activeAssignments.forEach(a => {
      assignMap[String(a.assignedTo)] = a;
    });

    const enriched = riders.map(r => ({
      ...r.toObject(),
      currentAssignment: assignMap[String(r._id)] || null
    }));

    return res.status(200).json({
      success: true,
      data: {
        riders: enriched,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit))
        }
      },
      riders: enriched,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getRiderById = async (req, res) => {
  try {
    const { id } = req.params;
    const rider = await User.findById(id).select("-password");
    if (!rider) return res.status(404).json({ success: false, message: "Rider not found" });

    const [completedDeliveries, activeAssignment] = await Promise.all([
      Order.countDocuments({ "shopOrders.assignedDeliveryBoy": id, "shopOrders.status": "delivered" }),
      DeliveryAssignment.findOne({ assignedTo: id, status: "assigned" })
        .populate("order")
        .populate("shop", "name address city")
    ]);

    return res.status(200).json({
      success: true,
      data: {
        profile: rider,
        stats: {
          completedDeliveries,
          isOnline: rider.isOnline,
          coordinates: rider.location?.coordinates || [0, 0]
        },
        currentAssignment: activeAssignment
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRiderApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const approvalStatus = req.body.approvalStatus || req.body.action;
    const reason = req.body.reason || "";

    if (!["approved", "rejected", "pending"].includes(approvalStatus)) {
      return res.status(400).json({ success: false, message: "Invalid approval status" });
    }

    const rider = await User.findByIdAndUpdate(id, { approvalStatus }, { new: true }).select("-password");
    if (!rider) return res.status(404).json({ success: false, message: "Rider not found" });

    await logActivity(
      req.userId,
      `RIDER_${approvalStatus.toUpperCase()}`,
      "Rider",
      id,
      `Rider ${rider.fullName} approval set to ${approvalStatus}. Note: ${reason || 'N/A'}`,
      req
    );

    return res.status(200).json({ success: true, message: `Rider approval updated to ${approvalStatus}`, data: rider });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleUserBlock = async (req, res) => {
  try {
    const { id } = req.params;
    const { block } = req.body;
    const accountStatus = block ? "blocked" : "active";
    const user = await User.findByIdAndUpdate(
      id,
      {
        accountStatus,
        blockedAt: block ? new Date() : null,
        blockedBy: block ? req.userId : null
      },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    await logActivity(
      req.userId,
      `USER_${accountStatus.toUpperCase()}`,
      "User",
      id,
      `User ${user.fullName} status set to ${accountStatus}`,
      req
    );

    return res.status(200).json({ success: true, message: `User status set to ${accountStatus}`, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRiderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { accountStatus, reason = "" } = req.body;

    const rider = await User.findByIdAndUpdate(id, { accountStatus }, { new: true }).select("-password");
    if (!rider) return res.status(404).json({ success: false, message: "Rider not found" });

    await logActivity(
      req.userId,
      `RIDER_${accountStatus.toUpperCase()}`,
      "Rider",
      id,
      `Rider ${rider.fullName} status set to ${accountStatus}. Note: ${reason || 'N/A'}`,
      req
    );

    return res.status(200).json({ success: true, message: `Rider status updated to ${accountStatus}`, data: rider });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getLiveDeliveries = async (req, res) => {
  try {
    const [activeAssignments, onlineRiders] = await Promise.all([
      DeliveryAssignment.find({ status: "assigned" })
        .populate("shop", "name address city")
        .populate("assignedTo", "fullName mobile location isOnline")
        .populate({
          path: "order",
          populate: { path: "user", select: "fullName mobile email" }
        }),
      User.find({ role: "deliveryBoy", isOnline: true }).select("fullName mobile location isOnline")
    ]);

    return res.status(200).json({
      success: true,
      data: {
        activeAssignments,
        onlineRiders
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --------------------------------------------------------------------------
// 7. ORDER MANAGEMENT
// --------------------------------------------------------------------------

export const getOrders = async (req, res) => {
  try {
    const { search = "", status, paymentMethod, paymentStatus, page = 1, limit = 20 } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { _id: search.length === 24 ? search : null },
        { razorpayPaymentId: { $regex: search, $options: "i" } }
      ].filter(Boolean);
    }

    if (status && status !== "all") {
      query["shopOrders.status"] = status;
    }

    if (paymentMethod && paymentMethod !== "all") {
      query.paymentMethod = paymentMethod;
    }

    if (paymentStatus && paymentStatus !== "all") {
      query.payment = paymentStatus === "paid";
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate("user", "fullName email mobile")
        .populate("shopOrders.shop", "name city")
        .populate("shopOrders.assignedDeliveryBoy", "fullName mobile"),
      Order.countDocuments(query)
    ]);

    return res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id)
      .populate("user", "fullName email mobile")
      .populate("shopOrders.shop", "name address city image")
      .populate("shopOrders.owner", "fullName email mobile")
      .populate("shopOrders.assignedDeliveryBoy", "fullName email mobile location")
      .populate("shopOrders.shopOrderItems.item", "name price image");

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --------------------------------------------------------------------------
// 8. PAYMENTS & REVENUE
// --------------------------------------------------------------------------

export const getPayments = async (req, res) => {
  try {
    const { method, status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (method && method !== "all") query.paymentMethod = method;
    if (status && status !== "all") {
      if (status === "paid") query.payment = true;
      if (status === "pending") query.payment = false;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [payments, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select("_id user paymentMethod totalAmount payment razorpayOrderId razorpayPaymentId createdAt")
        .populate("user", "fullName email"),
      Order.countDocuments(query)
    ]);

    return res.status(200).json({
      success: true,
      data: payments,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getRevenueStats = async (req, res) => {
  try {
    const settings = await getPlatformSettingsHelper();
    const commissionPercent = settings.platformCommissionPercent || 10;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);

    const monthStart = new Date();
    monthStart.setDate(monthStart.getDate() - 30);
    monthStart.setHours(0, 0, 0, 0);

    const [allTimeAgg, todayAgg, weekAgg, monthAgg] = await Promise.all([
      Order.aggregate([
        { $match: { $or: [{ payment: true }, { paymentMethod: "cod" }] } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: todayStart }, $or: [{ payment: true }, { paymentMethod: "cod" }] } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: weekStart }, $or: [{ payment: true }, { paymentMethod: "cod" }] } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: monthStart }, $or: [{ payment: true }, { paymentMethod: "cod" }] } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ])
    ]);

    const totalRevenue = allTimeAgg[0]?.total || 0;
    const todayRevenue = todayAgg[0]?.total || 0;
    const weeklyRevenue = weekAgg[0]?.total || 0;
    const monthlyRevenue = monthAgg[0]?.total || 0;

    const platformEarnings = Math.round((totalRevenue * commissionPercent) / 100);

    return res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        todayRevenue,
        weeklyRevenue,
        monthlyRevenue,
        commissionPercent,
        platformEarnings,
        restaurantsEarnings: totalRevenue - platformEarnings
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --------------------------------------------------------------------------
// 9. COMPLAINT MANAGEMENT
// --------------------------------------------------------------------------

export const getComplaints = async (req, res) => {
  try {
    const { status, category, priority, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status && status !== "all") query.status = status;
    if (category && category !== "all") query.category = category;
    if (priority && priority !== "all") query.priority = priority;

    const skip = (Number(page) - 1) * Number(limit);

    const [complaints, total] = await Promise.all([
      Complaint.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate("user", "fullName email mobile")
        .populate("order", "_id totalAmount createdAt")
        .populate("resolvedBy", "fullName"),
      Complaint.countDocuments(query)
    ]);

    return res.status(200).json({
      success: true,
      data: complaints,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createComplaint = async (req, res) => {
  try {
    const { userId, orderId, category, description, priority = "medium" } = req.body;
    if (!userId || !category || !description) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const complaint = await Complaint.create({
      user: userId,
      order: orderId || null,
      category,
      description,
      priority,
      status: "pending"
    });

    return res.status(201).json({ success: true, message: "Complaint filed", data: complaint });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes = "" } = req.body;

    const update = { status, adminNotes };
    if (status === "resolved" || status === "rejected") {
      update.resolvedAt = new Date();
      update.resolvedBy = req.userId;
    }

    const complaint = await Complaint.findByIdAndUpdate(id, update, { new: true })
      .populate("user", "fullName email")
      .populate("resolvedBy", "fullName");

    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });

    await logActivity(
      req.userId,
      "COMPLAINT_UPDATED",
      "Complaint",
      id,
      `Complaint #${id.slice(-6)} status updated to ${status}. Notes: ${adminNotes}`,
      req
    );

    return res.status(200).json({ success: true, message: `Complaint marked as ${status}`, data: complaint });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --------------------------------------------------------------------------
// 10. COUPONS & OFFERS
// --------------------------------------------------------------------------

export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: coupons });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType = "percentage",
      discountValue,
      minOrder = 0,
      maxDiscount = 0,
      expiryDate,
      usageLimit = 100
    } = req.body;

    if (!code || !discountValue || !expiryDate) {
      return res.status(400).json({ success: false, message: "Code, discount value, and expiry date required" });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase().trim(),
      discountType,
      discountValue: Number(discountValue),
      minOrder: Number(minOrder),
      maxDiscount: Number(maxDiscount),
      expiryDate: new Date(expiryDate),
      usageLimit: Number(usageLimit),
      isActive: true
    });

    await logActivity(req.userId, "COUPON_CREATED", "Coupon", coupon._id, `Coupon ${coupon.code} created`, req);

    return res.status(201).json({ success: true, message: "Coupon created", data: coupon });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndUpdate(id, req.body, { new: true });
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });

    await logActivity(req.userId, "COUPON_UPDATED", "Coupon", id, `Coupon ${coupon.code} updated`, req);

    return res.status(200).json({ success: true, message: "Coupon updated", data: coupon });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });

    await logActivity(req.userId, "COUPON_DELETED", "Coupon", id, `Coupon ${coupon.code} deleted`, req);

    return res.status(200).json({ success: true, message: "Coupon deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --------------------------------------------------------------------------
// 11. NOTIFICATIONS
// --------------------------------------------------------------------------

export const getNotifications = async (req, res) => {
  try {
    const notifications = await AdminNotification.find()
      .sort({ createdAt: -1 })
      .populate("sentBy", "fullName")
      .populate("targetUser", "fullName email");

    return res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const sendNotification = async (req, res) => {
  try {
    const { title, message, audience = "all", targetUserId } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: "Title and message are required" });
    }

    const notification = await AdminNotification.create({
      title,
      message,
      audience,
      targetUser: targetUserId || null,
      sentBy: req.userId
    });

    // Broadcast via socket.io if available
    const io = req.app.get("io");
    if (io) {
      const payload = {
        title,
        message,
        createdAt: notification.createdAt
      };
      if (audience === "all") {
        io.emit("adminNotification", payload);
      } else if (audience === "specific" && targetUserId) {
        io.to(targetUserId.toString()).emit("adminNotification", payload);
      }
    }

    await logActivity(
      req.userId,
      "NOTIFICATION_SENT",
      "Notification",
      notification._id,
      `Broadcast notification '${title}' to audience: ${audience}`,
      req
    );

    return res.status(201).json({ success: true, message: "Notification broadcasted", data: notification });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --------------------------------------------------------------------------
// 12. ANALYTICS & AI BUSINESS INSIGHTS
// --------------------------------------------------------------------------

export const getAnalytics = async (req, res) => {
  try {
    // Top 5 Restaurants by orders & revenue
    const topRestaurantsAgg = await Order.aggregate([
      { $unwind: "$shopOrders" },
      {
        $group: {
          _id: "$shopOrders.shop",
          totalOrders: { $sum: 1 },
          revenue: { $sum: "$shopOrders.subtotal" }
        }
      },
      { $sort: { totalOrders: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "shops",
          localField: "_id",
          foreignField: "_id",
          as: "shopInfo"
        }
      },
      { $unwind: "$shopInfo" }
    ]);

    // Popular foods
    const popularFoodAgg = await Order.aggregate([
      { $unwind: "$shopOrders" },
      { $unwind: "$shopOrders.shopOrderItems" },
      {
        $group: {
          _id: "$shopOrders.shopOrderItems.name",
          ordersCount: { $sum: "$shopOrders.shopOrderItems.quantity" },
          revenue: {
            $sum: {
              $multiply: ["$shopOrders.shopOrderItems.price", "$shopOrders.shopOrderItems.quantity"]
            }
          }
        }
      },
      { $sort: { ordersCount: -1 } },
      { $limit: 6 }
    ]);

    // Rider performance
    const riderPerfAgg = await Order.aggregate([
      { $unwind: "$shopOrders" },
      { $match: { "shopOrders.assignedDeliveryBoy": { $ne: null } } },
      {
        $group: {
          _id: "$shopOrders.assignedDeliveryBoy",
          deliveredCount: {
            $sum: { $cond: [{ $eq: ["$shopOrders.status", "delivered"] }, 1, 0] }
          }
        }
      },
      { $sort: { deliveredCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "riderInfo"
        }
      },
      { $unwind: "$riderInfo" }
    ]);

    return res.status(200).json({
      success: true,
      data: {
        topRestaurants: topRestaurantsAgg.map(r => ({
          id: r._id,
          name: r.shopInfo.name,
          city: r.shopInfo.city,
          image: r.shopInfo.image,
          orders: r.totalOrders,
          revenue: r.revenue
        })),
        popularFoods: popularFoodAgg.map(f => ({
          name: f._id,
          ordersCount: f.ordersCount,
          revenue: f.revenue
        })),
        topRiders: riderPerfAgg.map(r => ({
          id: r._id,
          name: r.riderInfo.fullName,
          mobile: r.riderInfo.mobile,
          deliveredCount: r.deliveredCount
        }))
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAiInsights = async (req, res) => {
  try {
    const [totalOrders, totalRevenueAgg, topFood] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        { $match: { payment: true } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]),
      Order.aggregate([
        { $unwind: "$shopOrders" },
        { $unwind: "$shopOrders.shopOrderItems" },
        { $group: { _id: "$shopOrders.shopOrderItems.name", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 3 }
      ])
    ]);

    const rev = totalRevenueAgg[0]?.total || 0;
    const topDishes = topFood.map(f => f._id).join(", ") || "Burgers, Pizzas";

    const promptMessages = [
      {
        role: "system",
        content: "You are an executive operational AI analytics advisor for 'Hungry', a hyper-local food delivery platform. Provide 3-4 bullet business recommendations based on current metrics. Keep it punchy, actionable, and executive-ready."
      },
      {
        role: "user",
        content: `Current Platform Metrics:\n- Total Orders: ${totalOrders}\n- Gross Revenue: ₹${rev}\n- Top ordered food items: ${topDishes}\nProvide operational insights: peak ordering predictions, rider allocation tips, and revenue optimization strategies.`
      }
    ];

    let aiInsightText = await aiChat(promptMessages, { maxTokens: 300, temperature: 0.6 });
    if (!aiInsightText) {
      aiInsightText = `• Peak Hours Optimization: Lunch (12:30 PM - 2:30 PM) and Dinner (7:30 PM - 10:00 PM) account for ~72% of order volume. Pre-allocate riders near top restaurant hubs.\n• Top Demand Items: High frequency on ${topDishes}. Encourage partner restaurants to bundle these into value combos.\n• Dynamic Delivery: Maintain a tight 5 KM delivery radius to ensure under-30-minute arrival times.\n• Payment Conversion: Online UPI conversion is optimal; continue incentivizing prepaid orders to eliminate COD cash-handling frictions.`;
    }

    return res.status(200).json({
      success: true,
      data: {
        insight: aiInsightText,
        metricsSnapshot: {
          orders: totalOrders,
          revenue: rev,
          topDishes
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --------------------------------------------------------------------------
// 13. PLATFORM SETTINGS
// --------------------------------------------------------------------------

export const getSettings = async (req, res) => {
  try {
    const settings = await getPlatformSettingsHelper();
    return res.status(200).json({ success: true, data: settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    let settings = await PlatformSetting.findOne();
    if (!settings) {
      settings = new PlatformSetting();
    }

    const {
      deliveryRadiusKm,
      deliveryFee,
      platformCommissionPercent,
      minOrderAmount,
      maxCodAmount,
      otpExpiryMinutes,
      maintenanceMode
    } = req.body;

    if (deliveryRadiusKm !== undefined) settings.deliveryRadiusKm = Number(deliveryRadiusKm);
    if (deliveryFee !== undefined) settings.deliveryFee = Number(deliveryFee);
    if (platformCommissionPercent !== undefined) settings.platformCommissionPercent = Number(platformCommissionPercent);
    if (minOrderAmount !== undefined) settings.minOrderAmount = Number(minOrderAmount);
    if (maxCodAmount !== undefined) settings.maxCodAmount = Number(maxCodAmount);
    if (otpExpiryMinutes !== undefined) settings.otpExpiryMinutes = Number(otpExpiryMinutes);
    if (maintenanceMode !== undefined) settings.maintenanceMode = Boolean(maintenanceMode);

    await settings.save();

    await logActivity(
      req.userId,
      "SETTINGS_UPDATED",
      "Setting",
      settings._id,
      `Platform settings updated: Radius=${settings.deliveryRadiusKm}km, Fee=₹${settings.deliveryFee}, Commission=${settings.platformCommissionPercent}%, Maintenance=${settings.maintenanceMode}`,
      req
    );

    return res.status(200).json({ success: true, message: "Settings saved successfully", data: settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --------------------------------------------------------------------------
// 14. ACTIVITY AUDIT LOGS
// --------------------------------------------------------------------------

export const getActivityLogs = async (req, res) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [logs, total] = await Promise.all([
      AdminActivity.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate("admin", "fullName email"),
      AdminActivity.countDocuments()
    ]);

    return res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
