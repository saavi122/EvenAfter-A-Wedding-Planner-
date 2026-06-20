import { Router } from "express";
import { registerUser, loginUser, logoutUser, getMe, getUserById } from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", verifyJWT, logoutUser);
router.get("/me", verifyJWT, getMe);
router.get("/user/:userId", verifyJWT, getUserById);

export default router;
