import Meeting from "../models/meeting.models.js";
import Client from "../models/client.models.js";
import Planner from "../models/planner.models.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const scheduleMeeting = asyncHandler(async (req, res) => {
    const { plannerId, date, time, agenda, meetingType } = req.body;

    if (!plannerId || !date || !time || !agenda || !meetingType) {
        throw new ApiError(400, "All fields (plannerId, date, time, agenda, meetingType) are required");
    }

    const clientProfile = await Client.findOne({ name: req.user._id });
    if (!clientProfile) {
        throw new ApiError(404, "Client profile not found");
    }

    let query = {};
    if (plannerId.match(/^[0-9a-fA-F]{24}$/)) {
        query = { _id: plannerId };
    } else {
        query = { plannerId: plannerId };
    }

    const planner = await Planner.findOne(query);
    if (!planner) {
        throw new ApiError(404, "Planner not found");
    }

    // Create a mock link based on meeting type
    let link = "https://meet.google.com/abc-defg-hij";
    if (meetingType === "Zoom") {
        link = "https://zoom.us/j/1234567890";
    } else if (meetingType === "Internal Video Call") {
        link = `/client/video-call/${planner.plannerId}`;
    }

    const meeting = await Meeting.create({
        clientId: clientProfile._id,
        plannerId: planner._id,
        date: new Date(date),
        time,
        agenda,
        meetingType,
        status: "Scheduled",
        link
    });

    return res.status(201).json(
        new ApiResponse(201, meeting, "Meeting scheduled successfully. Planner notified!")
    );
});

export const getMyMeetings = asyncHandler(async (req, res) => {
    let query = {};
    if (req.user.role === "client") {
        const clientProfile = await Client.findOne({ name: req.user._id });
        if (!clientProfile) {
            throw new ApiError(404, "Client profile not found");
        }
        query = { clientId: clientProfile._id };
    } else if (req.user.role === "planner") {
        const plannerProfile = await Planner.findOne({ name: req.user._id });
        if (!plannerProfile) {
            throw new ApiError(404, "Planner profile not found");
        }
        query = { plannerId: plannerProfile._id };
    }

    const meetings = await Meeting.find(query)
        .populate({
            path: 'clientId',
            populate: { path: 'name', select: 'name email phoneNo' }
        })
        .populate({
            path: 'plannerId',
            populate: { path: 'name', select: 'name email phoneNo' }
        })
        .sort({ date: 1, time: 1 });

    return res.status(200).json(
        new ApiResponse(200, meetings, "Meetings retrieved successfully")
    );
});
