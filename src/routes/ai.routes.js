import { Router } from "express";
import { chatWithPlanner } from "../controllers/ai.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import ApiError from "../utils/ApiError.js";

const router = Router();

// Middleware to ensure user is a client
const verifyClient = (req, res, next) => {
    if (req.user?.role !== 'client') {
        throw new ApiError(403, "Access denied: Only clients can access the AI Wedding Planner");
    }
    next();
};

router.post("/chat", verifyJWT, verifyClient, chatWithPlanner);

export default router;
