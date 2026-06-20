import { Router } from "express";
import { updateTaskStatus } from "../controllers/task.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.patch("/:taskId", verifyJWT, updateTaskStatus);

export default router;
