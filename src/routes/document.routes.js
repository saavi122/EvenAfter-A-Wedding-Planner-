import { Router } from "express";
import { getMyDocuments, uploadDocument } from "../controllers/document.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", verifyJWT, getMyDocuments);
router.post("/upload", verifyJWT, uploadDocument);

export default router;
