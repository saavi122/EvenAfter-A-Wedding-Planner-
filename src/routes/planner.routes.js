import { Router } from "express";
import { getAllPlanners, getPlannerById, getPlannerPortfolio, getPlannerEvents, getPlannerReviews } from "../controllers/planner.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Planners are fetched in client dashboard, so protect with verifyJWT
router.get("/", verifyJWT, getAllPlanners);
router.get("/:plannerId", verifyJWT, getPlannerById);
router.get("/:plannerId/portfolio", verifyJWT, getPlannerPortfolio);
router.get("/:plannerId/events", verifyJWT, getPlannerEvents);
router.get("/:plannerId/reviews", verifyJWT, getPlannerReviews);

export default router;
