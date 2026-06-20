import { Router } from "express";
import { 
    assignVendor, 
    getPlannerAssignments, 
    getVendorAssignments, 
    updateAssignmentStatus 
} from "../controllers/vendor.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", verifyJWT, assignVendor);
router.get("/planner", verifyJWT, getPlannerAssignments);
router.get("/vendor", verifyJWT, getVendorAssignments);
router.put("/:assignmentId", verifyJWT, updateAssignmentStatus);

export default router;
