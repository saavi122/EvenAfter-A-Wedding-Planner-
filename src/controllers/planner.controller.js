import Planner from "../models/planner.models.js";
import Portfolio from "../models/portfolio.models.js";
import EventHistory from "../models/eventHistory.models.js";
import Review from "../models/review.models.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getAllPlanners = asyncHandler(async (req, res) => {
    // Fetch all active planners and populate user info (name, email, phoneNo)
    const planners = await Planner.find({ status: "active" })
        .populate("name", "name email phoneNo")
        .populate("userId", "name email phoneNo");

    return res.status(200).json(
        new ApiResponse(200, planners, "Planners retrieved successfully")
    );
});

export const getPlannerById = asyncHandler(async (req, res) => {
    const { plannerId } = req.params;

    // Check if ID is MongoDB ObjectId or string plannerId
    let query = {};
    if (plannerId.match(/^[0-9a-fA-F]{24}$/)) {
        query = { _id: plannerId };
    } else {
        query = { plannerId: plannerId };
    }

    const planner = await Planner.findOne(query)
        .populate("name", "name email phoneNo")
        .populate("userId", "name email phoneNo");

    if (!planner) {
        throw new ApiError(404, "Planner not found");
    }

    return res.status(200).json(
        new ApiResponse(200, planner, "Planner profile retrieved successfully")
    );
});

export const getPlannerPortfolio = asyncHandler(async (req, res) => {
    const { plannerId } = req.params;

    let plannerQuery = {};
    if (plannerId.match(/^[0-9a-fA-F]{24}$/)) {
        plannerQuery = { _id: plannerId };
    } else {
        plannerQuery = { plannerId: plannerId };
    }

    const planner = await Planner.findOne(plannerQuery);
    if (!planner) {
        throw new ApiError(404, "Planner not found");
    }

    let portfolio = await Portfolio.findOne({ plannerId: planner._id });
    
    // Fallback if portfolio wasn't initialized
    if (!portfolio) {
        portfolio = await Portfolio.create({
            plannerId: planner._id,
            images: [],
            videos: [],
            testimonials: []
        });
    }

    return res.status(200).json(
        new ApiResponse(200, portfolio, "Planner portfolio retrieved successfully")
    );
});

export const getPlannerEvents = asyncHandler(async (req, res) => {
    const { plannerId } = req.params;

    let plannerQuery = {};
    if (plannerId.match(/^[0-9a-fA-F]{24}$/)) {
        plannerQuery = { _id: plannerId };
    } else {
        plannerQuery = { plannerId: plannerId };
    }

    const planner = await Planner.findOne(plannerQuery);
    if (!planner) {
        throw new ApiError(404, "Planner not found");
    }

    const events = await EventHistory.find({ plannerId: planner._id });

    return res.status(200).json(
        new ApiResponse(200, events, "Planner events retrieved successfully")
    );
});

export const getPlannerReviews = asyncHandler(async (req, res) => {
    const { plannerId } = req.params;

    let plannerQuery = {};
    if (plannerId.match(/^[0-9a-fA-F]{24}$/)) {
        plannerQuery = { _id: plannerId };
    } else {
        plannerQuery = { plannerId: plannerId };
    }

    const planner = await Planner.findOne(plannerQuery);
    if (!planner) {
        throw new ApiError(404, "Planner not found");
    }

    const reviews = await Review.find({ plannerId: planner._id });

    return res.status(200).json(
        new ApiResponse(200, reviews, "Planner reviews retrieved successfully")
    );
});
