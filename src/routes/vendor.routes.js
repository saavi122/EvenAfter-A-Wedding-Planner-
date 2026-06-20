import { Router } from "express";
import { 
    getAllVendors, 
    getVendorById, 
    shortlistVendor, 
    getShortlistedVendors,
    updateVendorProfile
} from "../controllers/vendor.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", verifyJWT, getAllVendors);
router.put("/profile", verifyJWT, updateVendorProfile);
router.get("/:vendorId", verifyJWT, getVendorById);
router.post("/shortlist", verifyJWT, shortlistVendor);
router.get("/shortlist/planner", verifyJWT, getShortlistedVendors);

export default router;
