import { Router } from "express";
import { getClientProfile, updateClientProfile, getMyPlanner } from "../controllers/client.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/profile", verifyJWT, getClientProfile);
router.put("/profile", verifyJWT, updateClientProfile);
router.get("/my-planner", verifyJWT, getMyPlanner);

export default router;
