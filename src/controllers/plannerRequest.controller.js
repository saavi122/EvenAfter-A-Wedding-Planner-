import PlannerRequest from "../models/plannerRequest.models.js";
import Client from "../models/client.models.js";
import Planner from "../models/planner.models.js";
import WeddingEvent from "../models/weddingEvent.models.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const sendPlannerRequest = asyncHandler(async (req, res) => {
    const { plannerId, weddingType, weddingDate, location, budget, requirements } = req.body;

    if (!plannerId || !weddingType || !weddingDate || !location || !budget) {
        throw new ApiError(400, "All fields (plannerId, weddingType, weddingDate, location, budget) are required");
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

    // Check if there is already an active/pending request for this planner
    const existingRequest = await PlannerRequest.findOne({
        clientId: clientProfile._id,
        plannerId: planner._id,
        status: { $in: ['Pending', 'In Discussion', 'Accepted'] }
    });

    if (existingRequest) {
        throw new ApiError(400, "You already have an active request or contract with this planner");
    }

    const plannerRequest = await PlannerRequest.create({
        clientId: clientProfile._id,
        plannerId: planner._id,
        weddingType,
        weddingDate: new Date(weddingDate),
        location,
        budget,
        requirements,
        status: "Pending"
    });

    return res.status(201).json(
        new ApiResponse(201, plannerRequest, "Hiring request sent successfully!")
    );
});

export const getClientRequests = asyncHandler(async (req, res) => {
    const clientProfile = await Client.findOne({ name: req.user._id });
    if (!clientProfile) {
        throw new ApiError(404, "Client profile not found");
    }

    const requests = await PlannerRequest.find({ clientId: clientProfile._id })
        .populate({
            path: 'plannerId',
            populate: { path: 'name', select: 'name email phoneNo' }
        })
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, requests, "Hiring requests retrieved successfully")
    );
});

export const getPlannerRequests = asyncHandler(async (req, res) => {
    const plannerProfile = await Planner.findOne({ name: req.user._id });
    if (!plannerProfile) {
        throw new ApiError(404, "Planner profile not found");
    }

    const requests = await PlannerRequest.find({ plannerId: plannerProfile._id })
        .populate({
            path: 'clientId',
            populate: { path: 'name', select: 'name email phoneNo' }
        })
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, requests, "Planner hiring requests retrieved successfully")
    );
});

export const updateRequestStatus = asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const { status } = req.body;

    if (!status || !['Pending', 'Accepted', 'Rejected', 'In Discussion'].includes(status)) {
        throw new ApiError(400, "Valid status is required");
    }

    const plannerRequest = await PlannerRequest.findById(requestId);
    if (!plannerRequest) {
        throw new ApiError(404, "Hiring request not found");
    }

    // Verify ownership
    const plannerProfile = await Planner.findOne({ name: req.user._id });
    if (!plannerProfile || plannerRequest.plannerId.toString() !== plannerProfile._id.toString()) {
        throw new ApiError(403, "You do not have permission to modify this request");
    }

    plannerRequest.status = status;
    await plannerRequest.save();

    // If accepted, we should release other requests or update status. For now, we just save.
    if (status === "Accepted") {
        // Also update planner assignedEvents count if we want, or do some hooks
        plannerProfile.assignedEvents = (parseInt(plannerProfile.assignedEvents || 0) + 1).toString();
        await plannerProfile.save();

        // Create wedding event automatically
        const clientProfile = await Client.findById(plannerRequest.clientId).populate("name");
        if (clientProfile) {
            let weddingEvent = await WeddingEvent.findOne({ clientId: clientProfile._id });
            const titleVal = clientProfile.name?.name ? `${clientProfile.name.name}'s Wedding` : "My Wedding";
            if (!weddingEvent) {
                weddingEvent = await WeddingEvent.create({
                    clientId: clientProfile._id,
                    plannerId: plannerProfile._id,
                    title: titleVal,
                    date: plannerRequest.weddingDate || clientProfile.weddingDate || new Date(),
                    venue: clientProfile.venue || plannerRequest.location || 'Umaid Bhawan Palace, Jodhpur',
                    budget: plannerRequest.budget || clientProfile.budget || 2000000,
                    status: 'Planning',
                    timeline: [
                        { title: 'Venue Selection', description: 'Confirm hotel venue booking', date: new Date(), status: 'In Progress' },
                        { title: 'Invitations', description: 'Design and send out wedding cards', date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), status: 'Pending' }
                    ],
                    budgetItems: [
                        { category: 'Venue', allocated: (plannerRequest.budget || 2000000) * 0.4, spent: 0, status: 'Allocated' },
                        { category: 'Floral & Decor', allocated: (plannerRequest.budget || 2000000) * 0.3, spent: 0, status: 'Allocated' },
                        { category: 'Catering', allocated: (plannerRequest.budget || 2000000) * 0.3, spent: 0, status: 'Allocated' }
                    ]
                });
            } else {
                weddingEvent.plannerId = plannerProfile._id;
                await weddingEvent.save();
            }
        }
    }

    return res.status(200).json(
        new ApiResponse(200, plannerRequest, `Request status updated to ${status}`)
    );
});
