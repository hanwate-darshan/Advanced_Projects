import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const isAdmin = async (req, res, next) => {
  try {
    const token = req.cookies?.token || (req.headers.authorization && req.headers.authorization.startsWith("Bearer ") ? req.headers.authorization.split(" ")[1] : null);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token missing"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token"
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required"
      });
    }

    if (user.accountStatus === "blocked" || user.accountStatus === "suspended") {
      return res.status(403).json({
        success: false,
        message: "Admin account is blocked or suspended"
      });
    }

    req.userId = user._id;
    req.adminUser = user;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Admin access required or session expired"
    });
  }
};

export default isAdmin;
