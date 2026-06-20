import { Router } from "express";
import { getChatMessages, sendChatMessage, getConversations } from "../controllers/chat.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/conversations", verifyJWT, getConversations);
router.get("/:receiverId", verifyJWT, getChatMessages);
router.post("/:receiverId", verifyJWT, sendChatMessage);

export default router;
