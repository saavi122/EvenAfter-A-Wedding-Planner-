import { Router } from "express";
import { 
    createWeddingEvent, 
    getMyWeddingEvents, 
    updateWeddingTimeline, 
    getEventSummary 
} from "../controllers/event.controller.js";
import { 
    getWeddingTasks, 
    createWeddingTask, 
    updateTaskStatus 
} from "../controllers/task.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Wedding Events endpoints
router.post("/", verifyJWT, createWeddingEvent);
router.get("/my-events", verifyJWT, getMyWeddingEvents);
router.put("/:eventId", verifyJWT, updateWeddingTimeline);
router.get("/:eventId/summary", verifyJWT, getEventSummary);

// Tasks endpoints
router.get("/:eventId/tasks", verifyJWT, getWeddingTasks);
router.post("/:eventId/tasks", verifyJWT, createWeddingTask);

export default router;
