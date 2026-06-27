import { Router } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.models.js";
import {
  createInvoice,
  getMyInvoices,
  getAdminInvoices,
  getBillingAnalytics
} from "../controllers/invoice.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Middleware to optionally verify JWT for checkout/guest flow
const optionalJWT = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    if (token) {
      const decodedToken = jwt.verify(
        token,
        process.env.JWT_SECRET || process.env.ACCESS_TOKEN_SECRET || "your_super_secret_jwt_key_here"
      );
      const user = await User.findById(decodedToken._id).select("-password");
      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    next();
  }
};

// Middleware to verify admin access
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "superadmin") {
    next();
  } else {
    res.status(403).json({ success: false, message: "Forbidden: Admin access only" });
  }
};

// Endpoints
router.post("/", optionalJWT, createInvoice);
router.get("/my", verifyJWT, getMyInvoices);
router.get("/admin", verifyJWT, isAdmin, getAdminInvoices);
router.get("/analytics", verifyJWT, isAdmin, getBillingAnalytics);

export default router;
