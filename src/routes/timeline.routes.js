import { Router } from "express";
import { updateWeddingTimeline } from "../controllers/event.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.put("/event/:eventId", verifyJWT, updateWeddingTimeline);

export default router;
