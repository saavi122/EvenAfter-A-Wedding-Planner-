import { Router } from "express";
import { 
    getAllVendors, 
    getVendorById, 
    shortlistVendor, 
    getShortlistedVendors,
    updateVendorProfile,
    addVendorEvent,
    getVendorAnalytics,
    getVendorProfileMe
} from "../controllers/vendor.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", verifyJWT, getAllVendors);
router.get("/profile/me", verifyJWT, getVendorProfileMe);
router.put("/profile", verifyJWT, updateVendorProfile);
router.post("/events", verifyJWT, addVendorEvent);
router.get("/analytics/stats", verifyJWT, getVendorAnalytics);
router.get("/:vendorId", verifyJWT, getVendorById);
router.post("/shortlist", verifyJWT, shortlistVendor);
router.get("/shortlist/planner", verifyJWT, getShortlistedVendors);

export default router;
