import jwt from "jsonwebtoken";
import User from "../models/user.models.js";
import Client from "../models/client.models.js";
import Planner from "../models/planner.models.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");
        
        if (!token) {
            throw new ApiError(401, "Unauthorized request: No token provided");
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET || process.env.ACCESS_TOKEN_SECRET);
        
        const user = await User.findById(decodedToken?._id).select("-password");
        
        if (!user) {
            throw new ApiError(401, "Invalid Access Token: User not found");
        }

        req.user = user;

        // If client or planner, fetch their specific profiles
        if (user.role === 'client') {
            const clientProfile = await Client.findOne({ name: user._id }); // In schema name ref user
            req.client = clientProfile;
        } else if (user.role === 'planner') {
            const plannerProfile = await Planner.findOne({ name: user._id }); // In schema name ref user
            req.planner = plannerProfile;
        }

        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});
