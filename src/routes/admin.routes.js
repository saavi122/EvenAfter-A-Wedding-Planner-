import { Router } from "express";
import { 
    getAdminUsers, 
    updateUserStatus, 
    deleteUser, 
    getPendingVendors, 
    approveVendorStatus, 
    getAnalyticsStats, 
    broadcastNotification, 
    getAuditLogs,
    getFAQs,
    createFAQ,
    deleteFAQ,
    getTestimonials,
    createTestimonial,
    deleteTestimonial,
    getGallery,
    createGalleryItem,
    deleteGalleryItem
} from "../controllers/admin.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Middleware to verify admin access
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === "superadmin") {
        next();
    } else {
        res.status(403).json({ success: false, message: "Forbidden: Admin access only" });
    }
};

// Users management
router.get("/users", verifyJWT, isAdmin, getAdminUsers);
router.patch("/users/:userId", verifyJWT, isAdmin, updateUserStatus);
router.delete("/users/:userId", verifyJWT, isAdmin, deleteUser);

// Vendors approval
router.get("/vendors/pending", verifyJWT, isAdmin, getPendingVendors);
router.patch("/vendors/:vendorId/verify", verifyJWT, isAdmin, approveVendorStatus);

// Analytics, Audits, Notifications
router.get("/analytics/stats", verifyJWT, isAdmin, getAnalyticsStats);
router.get("/audit-logs", verifyJWT, isAdmin, getAuditLogs);
router.post("/broadcast", verifyJWT, isAdmin, broadcastNotification);

// Homepage content FAQ
router.get("/faqs", getFAQs);
router.post("/faqs", verifyJWT, isAdmin, createFAQ);
router.delete("/faqs/:id", verifyJWT, isAdmin, deleteFAQ);

// Homepage Testimonials
router.get("/testimonials", getTestimonials);
router.post("/testimonials", verifyJWT, isAdmin, createTestimonial);
router.delete("/testimonials/:id", verifyJWT, isAdmin, deleteTestimonial);

// Homepage Gallery
router.get("/gallery", getGallery);
router.post("/gallery", verifyJWT, isAdmin, createGalleryItem);
router.delete("/gallery/:id", verifyJWT, isAdmin, deleteGalleryItem);

export default router;
