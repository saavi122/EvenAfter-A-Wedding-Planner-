import { Router } from "express";
import { scheduleMeeting, getMyMeetings } from "../controllers/meeting.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", verifyJWT, scheduleMeeting);
router.get("/", verifyJWT, getMyMeetings);

export default router;
