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
    deleteGalleryItem,
    updateUserSubscription
} from "../controllers/admin.controller.js";
import {
    getAdminEvents,
    getAdminEventById,
    createAdminEvent,
    updateAdminEvent,
    deleteAdminEvent,
    assignPlanner,
    assignVendors,
    getEventProgress,
    getEventChatHistory,
    getAdminClients,
    getAdminPlanners,
    getAdminVendors
} from "../controllers/adminEvent.controller.js";
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
router.patch("/users/:userId/subscription", verifyJWT, isAdmin, updateUserSubscription);
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

// Event Management Routes
router.get("/events", verifyJWT, isAdmin, getAdminEvents);
router.post("/events", verifyJWT, isAdmin, createAdminEvent);
router.get("/events/:id", verifyJWT, isAdmin, getAdminEventById);
router.put("/events/:id", verifyJWT, isAdmin, updateAdminEvent);
router.delete("/events/:id", verifyJWT, isAdmin, deleteAdminEvent);
router.put("/events/:id/assign-planner", verifyJWT, isAdmin, assignPlanner);
router.put("/events/:id/assign-vendors", verifyJWT, isAdmin, assignVendors);
router.get("/events/:id/progress", verifyJWT, isAdmin, getEventProgress);
router.get("/events/:id/chat", verifyJWT, isAdmin, getEventChatHistory);

// Dropdown Helper Routes
router.get("/clients", verifyJWT, isAdmin, getAdminClients);
router.get("/planners", verifyJWT, isAdmin, getAdminPlanners);
router.get("/vendors", verifyJWT, isAdmin, getAdminVendors);

export default router;
