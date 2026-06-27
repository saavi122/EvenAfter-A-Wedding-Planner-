import WeddingEvent from "../models/weddingEvent.models.js";
import Client from "../models/client.models.js";
import Planner from "../models/planner.models.js";
import Vendor from "../models/vendor.models.js";
import Task from "../models/task.models.js";
import ChatMessage from "../models/chatMessage.models.js";
import User from "../models/user.models.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// Helper function to calculate progress percentage based on timeline status
const calculateEventProgress = (timeline) => {
    if (!timeline || timeline.length === 0) return 0;
    const completed = timeline.filter(item => item.status === 'Completed').length;
    return Math.round((completed / timeline.length) * 100);
};

// 1. Get all events with filters & search
export const getAdminEvents = asyncHandler(async (req, res) => {
    const { search, eventType, status, city, minBudget, maxBudget, clientId, plannerId, vendorId } = req.query;

    let query = {};

    // Search query on title, venue, location, eventType
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: "i" } },
            { venue: { $regex: search, $options: "i" } },
            { location: { $regex: search, $options: "i" } },
            { eventType: { $regex: search, $options: "i" } }
        ];
    }

    if (eventType) {
        query.eventType = eventType;
    }

    if (status) {
        query.status = status;
    }

    if (city) {
        query.location = { $regex: city, $options: "i" };
    }

    if (minBudget || maxBudget) {
        query.budget = {};
        if (minBudget) query.budget.$gte = Number(minBudget);
        if (maxBudget) query.budget.$lte = Number(maxBudget);
    }

    if (clientId) {
        query.clientId = clientId;
    }

    if (plannerId) {
        query.plannerId = plannerId;
    }

    if (vendorId) {
        query.vendors = vendorId;
    }

    const events = await WeddingEvent.find(query)
        .populate({
            path: 'clientId',
            populate: { path: 'name', select: 'name email phoneNo' }
        })
        .populate({
            path: 'plannerId',
            populate: { path: 'name', select: 'name email phoneNo companyName exprience' }
        })
        .populate({
            path: 'vendors',
            populate: { path: 'name', select: 'name email phoneNo' }
        })
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, events, "Events retrieved successfully")
    );
});

// 2. Get detailed event by ID
export const getAdminEventById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const event = await WeddingEvent.findById(id)
        .populate({
            path: 'clientId',
            populate: { path: 'name', select: 'name email phoneNo' }
        })
        .populate({
            path: 'plannerId',
            populate: { path: 'name', select: 'name email phoneNo companyName exprience' }
        })
        .populate({
            path: 'vendors',
            populate: { path: 'name', select: 'name email phoneNo' }
        });

    if (!event) {
        throw new ApiError(404, "Event not found");
    }

    return res.status(200).json(
        new ApiResponse(200, event, "Event details retrieved successfully")
    );
});

// 3. Create a new event
export const createAdminEvent = asyncHandler(async (req, res) => {
    const { clientId, title, eventType, date, venue, location, budget, guestCount, status, plannerId } = req.body;

    if (!clientId || !title) {
        throw new ApiError(400, "Client and Event Title are required fields");
    }

    const clientProfile = await Client.findById(clientId);
    if (!clientProfile) {
        throw new ApiError(404, "Client profile not found");
    }

    const eventBudget = budget ? Number(budget) : 0;
    
    // Default budget items breakdown
    const defaultBudgetItems = [
        { category: "Venue", allocated: eventBudget * 0.35, spent: 0, status: "Allocated" },
        { category: "Catering", allocated: eventBudget * 0.25, spent: 0, status: "Allocated" },
        { category: "Decoration", allocated: eventBudget * 0.15, spent: 0, status: "Allocated" },
        { category: "Photography", allocated: eventBudget * 0.10, spent: 0, status: "Allocated" },
        { category: "Makeup", allocated: eventBudget * 0.05, spent: 0, status: "Allocated" },
        { category: "Entertainment", allocated: eventBudget * 0.05, spent: 0, status: "Allocated" },
        { category: "Miscellaneous", allocated: eventBudget * 0.05, spent: 0, status: "Allocated" }
    ];

    // Default timeline milestones
    const defaultTimeline = [
        { title: "Booking Confirmed", description: "Event booking and client profile verified", date: new Date(), status: "Completed" },
        { title: "Planner Assigned", description: "Dedicated planner assigned to supervise logistics", date: new Date(), status: plannerId ? "Completed" : "Pending" },
        { title: "Venue Finalized", description: "Select and lock the event venue site", date: date ? new Date(date) : new Date(), status: "Pending" },
        { title: "Vendors Assigned", description: "Coordinate with caterers, florists, photographers, and key helpers", date: date ? new Date(date) : new Date(), status: "Pending" },
        { title: "Decoration Planning", description: "Stage layout, flower choice, and themes selected", date: date ? new Date(date) : new Date(), status: "Pending" },
        { title: "Food Planning", description: "Seeding and finalizing veg/non-veg menu boards", date: date ? new Date(date) : new Date(), status: "Pending" },
        { title: "Wedding Preparation", description: "Rehearsals, outfits, and wedding week initialization", date: date ? new Date(date) : new Date(), status: "Pending" },
        { title: "Event Completed", description: "Host ceremonies and wrap up payments", date: date ? new Date(date) : new Date(), status: "Pending" }
    ];

    const event = await WeddingEvent.create({
        clientId,
        plannerId: plannerId || undefined,
        title,
        eventType: eventType || "Wedding",
        date: date ? new Date(date) : undefined,
        venue: venue || "To Be Decided",
        location: location || "",
        budget: eventBudget,
        guestCount: guestCount ? Number(guestCount) : 0,
        status: status || "Planning",
        timeline: defaultTimeline,
        budgetItems: defaultBudgetItems,
        progress: plannerId ? 25 : 12 // set progress based on completed timeline items
    });

    return res.status(201).json(
        new ApiResponse(201, event, "Event created successfully")
    );
});

// 4. Update event details
export const updateAdminEvent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, eventType, date, venue, location, budget, guestCount, status, progress, timeline, budgetItems } = req.body;

    const event = await WeddingEvent.findById(id);
    if (!event) {
        throw new ApiError(404, "Event not found");
    }

    if (title !== undefined) event.title = title;
    if (eventType !== undefined) event.eventType = eventType;
    if (date !== undefined) event.date = new Date(date);
    if (venue !== undefined) event.venue = venue;
    if (location !== undefined) event.location = location;
    if (budget !== undefined) event.budget = Number(budget);
    if (guestCount !== undefined) event.guestCount = Number(guestCount);
    if (status !== undefined) event.status = status;
    if (timeline !== undefined) {
        event.timeline = timeline;
        event.progress = calculateEventProgress(timeline);
    } else if (progress !== undefined) {
        event.progress = Number(progress);
    }
    if (budgetItems !== undefined) event.budgetItems = budgetItems;

    await event.save();

    return res.status(200).json(
        new ApiResponse(200, event, "Event details updated successfully")
    );
});

// 5. Delete event
export const deleteAdminEvent = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const event = await WeddingEvent.findByIdAndDelete(id);
    if (!event) {
        throw new ApiError(404, "Event not found");
    }

    // Clean up associated tasks
    await Task.deleteMany({ eventId: id });

    return res.status(200).json(
        new ApiResponse(200, null, "Event and associated tasks deleted successfully")
    );
});

// 6. Assign planner
export const assignPlanner = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { plannerId } = req.body; // pass null to unassign

    const event = await WeddingEvent.findById(id);
    if (!event) {
        throw new ApiError(404, "Event not found");
    }

    event.plannerId = plannerId || undefined;
    
    // Update timeline step "Planner Assigned" status
    if (event.timeline && event.timeline.length > 1) {
        const plannerTimelineStep = event.timeline.find(item => item.title === "Planner Assigned");
        if (plannerTimelineStep) {
            plannerTimelineStep.status = plannerId ? "Completed" : "Pending";
            event.progress = calculateEventProgress(event.timeline);
        }
    }

    await event.save();

    const populated = await event.populate({
        path: 'plannerId',
        populate: { path: 'name', select: 'name email phoneNo companyName' }
    });

    return res.status(200).json(
        new ApiResponse(200, populated, "Planner assigned successfully")
    );
});

// 7. Assign vendors
export const assignVendors = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { vendors } = req.body; // array of vendor IDs

    if (!Array.isArray(vendors)) {
        throw new ApiError(400, "Vendors must be an array of IDs");
    }

    const event = await WeddingEvent.findById(id);
    if (!event) {
        throw new ApiError(404, "Event not found");
    }

    event.vendors = vendors;

    // Update timeline step "Vendors Assigned" status
    if (event.timeline && event.timeline.length > 3) {
        const vendorTimelineStep = event.timeline.find(item => item.title === "Vendors Assigned");
        if (vendorTimelineStep) {
            vendorTimelineStep.status = vendors.length > 0 ? "Completed" : "Pending";
            event.progress = calculateEventProgress(event.timeline);
        }
    }

    await event.save();

    const populated = await event.populate({
        path: 'vendors',
        populate: { path: 'name', select: 'name email phoneNo' }
    });

    return res.status(200).json(
        new ApiResponse(200, populated, "Vendors assignment updated successfully")
    );
});

// 8. Get event progress metrics
export const getEventProgress = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const event = await WeddingEvent.findById(id);
    if (!event) {
        throw new ApiError(404, "Event not found");
    }

    const totalTasks = await Task.countDocuments({ eventId: id });
    const completedTasks = await Task.countDocuments({ eventId: id, status: 'Completed' });
    const pendingTasks = totalTasks - completedTasks;

    const totalBudget = event.budget || 0;
    const amountSpent = event.budgetItems ? event.budgetItems.reduce((acc, curr) => acc + (curr.spent || 0), 0) : 0;
    const remainingBudget = totalBudget - amountSpent;

    return res.status(200).json(
        new ApiResponse(200, {
            progress: event.progress,
            totalTasks,
            completedTasks,
            pendingTasks,
            totalBudget,
            amountSpent,
            remainingBudget,
            budgetBreakdown: event.budgetItems || []
        }, "Event progress retrieved successfully")
    );
});

// 9. Get client-planner chat history
export const getEventChatHistory = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const event = await WeddingEvent.findById(id)
        .populate('clientId')
        .populate('plannerId');

    if (!event) {
        throw new ApiError(404, "Event not found");
    }

    if (!event.clientId || !event.plannerId) {
        return res.status(200).json(
            new ApiResponse(200, [], "Chat history empty: Event needs both a Client and Planner assigned")
        );
    }

    // In profiles, 'name' is the ref to User ID
    const clientUserId = event.clientId.name;
    const plannerUserId = event.plannerId.name;

    if (!clientUserId || !plannerUserId) {
        return res.status(200).json(
            new ApiResponse(200, [], "Chat history empty: Client or Planner user references missing")
        );
    }

    const conversationId = [clientUserId.toString(), plannerUserId.toString()].sort().join("_");
    
    const messages = await ChatMessage.find({ conversationId })
        .sort({ createdAt: 1 })
        .populate('sender', 'name email role');

    return res.status(200).json(
        new ApiResponse(200, messages, "Chat history retrieved successfully")
    );
});

// 10. List Client profiles
export const getAdminClients = asyncHandler(async (req, res) => {
    const clients = await Client.find({}).populate('name', 'name email phoneNo');
    return res.status(200).json(
        new ApiResponse(200, clients, "Clients retrieved successfully")
    );
});

// 11. List Planner profiles
export const getAdminPlanners = asyncHandler(async (req, res) => {
    const planners = await Planner.find({}).populate('name', 'name email phoneNo');
    return res.status(200).json(
        new ApiResponse(200, planners, "Planners retrieved successfully")
    );
});

// 12. List Vendor profiles
export const getAdminVendors = asyncHandler(async (req, res) => {
    const vendors = await Vendor.find({}).populate('name', 'name email phoneNo');
    return res.status(200).json(
        new ApiResponse(200, vendors, "Vendors retrieved successfully")
    );
});
