import { Router } from "express";
import { sendPlannerRequest, getClientRequests, getPlannerRequests, updateRequestStatus } from "../controllers/plannerRequest.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", verifyJWT, sendPlannerRequest);
router.get("/client", verifyJWT, getClientRequests);
router.get("/planner", verifyJWT, getPlannerRequests);
router.put("/:requestId", verifyJWT, updateRequestStatus);

export default router;
