import Document from "../models/document.models.js";
import WeddingEvent from "../models/weddingEvent.models.js";
import Client from "../models/client.models.js";
import Planner from "../models/planner.models.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// Get list of documents
export const getMyDocuments = asyncHandler(async (req, res) => {
    let query = {};
    if (req.user.role === "client") {
        const clientProfile = await Client.findOne({ name: req.user._id });
        if (!clientProfile) {
            throw new ApiError(404, "Client profile not found");
        }
        // Get active wedding event
        const weddingEvent = await WeddingEvent.findOne({ clientId: clientProfile._id });
        if (weddingEvent) {
            query = { eventId: weddingEvent._id };
        } else {
            return res.status(200).json(new ApiResponse(200, [], "No active wedding event"));
        }
    } else if (req.user.role === "planner") {
        const plannerProfile = await Planner.findOne({ name: req.user._id });
        if (!plannerProfile) {
            throw new ApiError(404, "Planner profile not found");
        }
        // Get all events managed by planner
        const weddingEvents = await WeddingEvent.find({ plannerId: plannerProfile._id });
        const eventIds = weddingEvents.map(e => e._id);
        query = { eventId: { $in: eventIds } };
    } else {
        // Fallback
        query = { uploadedBy: req.user._id };
    }

    const docs = await Document.find(query).sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, docs, "Documents retrieved successfully")
    );
});

// Upload a document
export const uploadDocument = asyncHandler(async (req, res) => {
    const { name, type, size, eventId } = req.body;

    if (!name || !type || !size) {
        throw new ApiError(400, "Document metadata (name, type, size) is required");
    }

    let targetEventId = eventId;
    
    // If client, automatically find active wedding event id
    if (!targetEventId && req.user.role === "client") {
        const clientProfile = await Client.findOne({ name: req.user._id });
        if (clientProfile) {
            const weddingEvent = await WeddingEvent.findOne({ clientId: clientProfile._id });
            if (weddingEvent) {
                targetEventId = weddingEvent._id;
            }
        }
    }

    const document = await Document.create({
        eventId: targetEventId,
        name,
        type,
        size,
        url: "#", // Mock download link
        uploadedBy: req.user._id
    });

    return res.status(201).json(
        new ApiResponse(201, document, "Document uploaded/registered successfully")
    );
});
