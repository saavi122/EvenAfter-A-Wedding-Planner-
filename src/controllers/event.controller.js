import WeddingEvent from "../models/weddingEvent.models.js";
import Client from "../models/client.models.js";
import Planner from "../models/planner.models.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// Create Wedding Request / Event
export const createWeddingEvent = asyncHandler(async (req, res) => {
    const { title, weddingType, weddingDate, venuePreference, venue, budget, totalBudget, specialRequirements, description } = req.body;

    const clientProfile = await Client.findOne({ name: req.user._id });
    if (!clientProfile) {
        throw new ApiError(404, "Client profile not found");
    }

    const eventTitle = title || weddingType || "My Wedding";
    const eventDate = weddingDate || new Date();
    const eventVenue = venue || venuePreference || "To Be Decided";
    const eventBudget = budget || totalBudget || 0;

    const weddingEvent = await WeddingEvent.create({
        clientId: clientProfile._id,
        title: eventTitle,
        date: new Date(eventDate),
        venue: eventVenue,
        budget: eventBudget,
        status: "Planning",
        timeline: [
            { title: "Engagement / Initial Booking", description: "Wedding planning initialized", date: new Date(), status: "Completed" }
        ],
        budgetItems: [
            { category: "Venue", allocated: eventBudget * 0.4, spent: 0, status: "Allocated" },
            { category: "Catering", allocated: eventBudget * 0.3, spent: 0, status: "Allocated" }
        ]
    });

    return res.status(201).json(
        new ApiResponse(201, weddingEvent, "Wedding Event created successfully")
    );
});

// Get events for the logged in client or planner
export const getMyWeddingEvents = asyncHandler(async (req, res) => {
    let query = {};
    if (req.user.role === "client") {
        const clientProfile = await Client.findOne({ name: req.user._id });
        if (!clientProfile) {
            return res.status(200).json(new ApiResponse(200, [], "No client profile found"));
        }
        query = { clientId: clientProfile._id };
    } else if (req.user.role === "planner") {
        const plannerProfile = await Planner.findOne({ name: req.user._id });
        if (!plannerProfile) {
            return res.status(200).json(new ApiResponse(200, [], "No planner profile found"));
        }
        query = { plannerId: plannerProfile._id };
    } else {
        // Admin or other roles see all events
        query = {};
    }

    const events = await WeddingEvent.find(query)
        .populate({
            path: 'clientId',
            populate: { path: 'name', select: 'name email phoneNo' }
        })
        .populate({
            path: 'plannerId',
            populate: { path: 'name', select: 'name email phoneNo' }
        })
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, events, "Wedding Events retrieved successfully")
    );
});

// Update event timeline
export const updateWeddingTimeline = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const { timeline, budgetItems, budget, progress, status, venue, date } = req.body;

    const weddingEvent = await WeddingEvent.findById(eventId);
    if (!weddingEvent) {
        throw new ApiError(404, "Wedding Event not found");
    }

    // Verify planner or client access
    if (timeline !== undefined) weddingEvent.timeline = timeline;
    if (budgetItems !== undefined) weddingEvent.budgetItems = budgetItems;
    if (budget !== undefined) weddingEvent.budget = budget;
    if (progress !== undefined) weddingEvent.progress = progress;
    if (status !== undefined) weddingEvent.status = status;
    if (venue !== undefined) weddingEvent.venue = venue;
    if (date !== undefined) weddingEvent.date = new Date(date);

    await weddingEvent.save();

    return res.status(200).json(
        new ApiResponse(200, weddingEvent, "Wedding Event updated successfully")
    );
});

// Get Event Summary (totalBudget, spentAmount, remainingBudget)
export const getEventSummary = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const weddingEvent = await WeddingEvent.findById(eventId);
    if (!weddingEvent) {
        throw new ApiError(404, "Wedding Event not found");
    }

    const totalBudget = weddingEvent.budget || 0;
    const spentAmount = weddingEvent.budgetItems.reduce((acc, item) => acc + (item.spent || 0), 0);
    const remainingBudget = totalBudget - spentAmount;

    return res.status(200).json(
        new ApiResponse(200, {
            totalBudget,
            spentAmount,
            remainingBudget
        }, "Event summary retrieved")
    );
});
