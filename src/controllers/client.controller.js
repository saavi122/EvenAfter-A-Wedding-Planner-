import Client from "../models/client.models.js";
import User from "../models/user.models.js";
import Planner from "../models/planner.models.js";
import PlannerRequest from "../models/plannerRequest.models.js";
import Meeting from "../models/meeting.models.js";
import WeddingEvent from "../models/weddingEvent.models.js";
import Task from "../models/task.models.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getClientProfile = asyncHandler(async (req, res) => {
    // req.user is populated by verifyJWT
    const clientProfile = await Client.findOne({ name: req.user._id })
        .populate("name", "name email phoneNo createdAt")
        .populate("userId", "name email phoneNo createdAt");

    if (!clientProfile) {
        throw new ApiError(404, "Client profile not found");
    }

    return res.status(200).json(
        new ApiResponse(200, clientProfile, "Client profile retrieved successfully")
    );
});

export const updateClientProfile = asyncHandler(async (req, res) => {
    const { name, phone, address, profilePhoto, partnerName, weddingDate, location, budget, EventIdName } = req.body;

    // Find client profile
    const clientProfile = await Client.findOne({ name: req.user._id });
    if (!clientProfile) {
        throw new ApiError(404, "Client profile not found");
    }

    // Update user details
    const userUpdate = {};
    if (name) userUpdate.name = name;
    if (phone) userUpdate.phoneNo = phone;

    if (Object.keys(userUpdate).length > 0) {
        await User.findByIdAndUpdate(req.user._id, userUpdate);
    }

    // Update client profile details
    if (address !== undefined) clientProfile.address = address;
    if (profilePhoto !== undefined) clientProfile.profilePhoto = profilePhoto;
    if (partnerName !== undefined) clientProfile.partnerName = partnerName;
    if (weddingDate !== undefined) clientProfile.weddingDate = weddingDate;
    if (location !== undefined) clientProfile.location = location;
    if (budget !== undefined) clientProfile.budget = budget;
    if (EventIdName !== undefined) clientProfile.EventIdName = EventIdName;

    await clientProfile.save();

    const updatedProfile = await Client.findOne({ name: req.user._id })
        .populate("name", "name email phoneNo createdAt")
        .populate("userId", "name email phoneNo createdAt");

    return res.status(200).json(
        new ApiResponse(200, updatedProfile, "Client profile updated successfully")
    );
});

export const getMyPlanner = asyncHandler(async (req, res) => {
    const clientProfile = await Client.findOne({ name: req.user._id });
    if (!clientProfile) {
        throw new ApiError(404, "Client not found");
    }

    // Find if there is an accepted request
    const acceptedRequest = await PlannerRequest.findOne({
        clientId: clientProfile._id,
        status: "Accepted"
    });

    if (!acceptedRequest) {
        return res.status(200).json(
            new ApiResponse(200, { hired: false }, "No planner hired yet")
        );
    }

    // Fetch planner details
    const planner = await Planner.findById(acceptedRequest.plannerId)
        .populate("name", "name email phoneNo")
        .populate("userId", "name email phoneNo");

    if (!planner) {
        return res.status(200).json(
            new ApiResponse(200, { hired: false }, "Assigned planner not found in database")
        );
    }

    // Fetch upcoming meetings
    const upcomingMeetings = await Meeting.find({
        clientId: clientProfile._id,
        plannerId: planner._id,
        date: { $gte: new Date() }
    }).sort({ date: 1, time: 1 });

    // Fetch active wedding event details
    const weddingEvent = await WeddingEvent.findOne({ clientId: clientProfile._id });

    // Fetch checklist tasks
    let currentTasks = [];
    if (weddingEvent) {
        currentTasks = await Task.find({ eventId: weddingEvent._id }).sort({ createdAt: -1 });
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                hired: true,
                planner,
                request: acceptedRequest,
                weddingEvent,
                currentTasks: currentTasks.map(t => ({
                    id: t._id,
                    text: t.title,
                    done: t.status === 'Completed'
                })),
                upcomingMeetings
            },
            "Hired planner details retrieved successfully"
        )
    );
});
