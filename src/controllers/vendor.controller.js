import Vendor from "../models/vendor.models.js";
import Planner from "../models/planner.models.js";
import ShortlistedVendor from "../models/shortlistedVendor.models.js";
import VendorAssignment from "../models/vendorAssignment.models.js";
import Client from "../models/client.models.js";
import User from "../models/user.models.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// Get all active vendors
export const getAllVendors = asyncHandler(async (req, res) => {
    const vendors = await Vendor.find({ status: "active" })
        .populate("name", "name email phoneNo")
        .populate("userId", "name email phoneNo");

    return res.status(200).json(
        new ApiResponse(200, vendors, "Vendors retrieved successfully")
    );
});

// Get vendor by ID
export const getVendorById = asyncHandler(async (req, res) => {
    const { vendorId } = req.params;

    let query = {};
    if (vendorId.match(/^[0-9a-fA-F]{24}$/)) {
        query = { _id: vendorId };
    } else {
        query = { vendorId: vendorId };
    }

    const vendorDetail = await Vendor.findOne(query)
        .populate("name", "name email phoneNo")
        .populate("userId", "name email phoneNo");

    if (!vendorDetail) {
        throw new ApiError(404, "Vendor profile not found");
    }

    // Increment profile view count
    vendorDetail.profileViews = (vendorDetail.profileViews || 0) + 1;
    await vendorDetail.save();

    // Mock reviews
    const mockReviews = [
        { clientName: "Priya & Raj", rating: 5, text: "Absolutely stunning floral mandap decoration. Exceeded all expectations!", verified: true },
        { clientName: "Nikhil Verma", rating: 4, text: "Great food catering. The main course was highly appreciated by the guests.", verified: true }
    ];

    const mockPreviousEvents = [
        { name: "Siddharth & Kiara's Reception", venue: "The Leela Palace, Udaipur", date: "2025-12-10", role: "Catering", rating: 5 },
        { name: "Kabir & Rhea's Sunset Vows", venue: "W Hotel Beach Front, Goa", date: "2026-01-05", role: "Floral Decor", rating: 5 }
    ];

    const previousEvents = (vendorDetail.previousEvents && vendorDetail.previousEvents.length > 0)
        ? vendorDetail.previousEvents
        : mockPreviousEvents;

    return res.status(200).json(
        new ApiResponse(
            200, 
            { 
                vendor: vendorDetail,
                reviews: mockReviews,
                previousEvents: previousEvents
            }, 
            "Vendor profile details retrieved"
        )
    );
});

// Shortlist a vendor
export const shortlistVendor = asyncHandler(async (req, res) => {
    const { vendorId, eventId } = req.body;

    if (!vendorId) {
        throw new ApiError(400, "Vendor ID is required");
    }

    const plannerProfile = await Planner.findOne({ name: req.user._id });
    if (!plannerProfile) {
        throw new ApiError(404, "Planner profile not found");
    }

    // Check if already shortlisted
    const existing = await ShortlistedVendor.findOne({
        plannerId: plannerProfile._id,
        vendorId
    });

    if (existing) {
        return res.status(200).json(
            new ApiResponse(200, existing, "Vendor is already in your shortlist")
        );
    }

    const shortlist = await ShortlistedVendor.create({
        plannerId: plannerProfile._id,
        vendorId,
        eventId: eventId || "",
        status: "Shortlisted"
    });

    return res.status(201).json(
        new ApiResponse(201, shortlist, "Vendor shortlisted successfully")
    );
});

// Get shortlisted vendors for planner
export const getShortlistedVendors = asyncHandler(async (req, res) => {
    const plannerProfile = await Planner.findOne({ name: req.user._id });
    if (!plannerProfile) {
        throw new ApiError(404, "Planner profile not found");
    }

    const shortlisted = await ShortlistedVendor.find({ plannerId: plannerProfile._id })
        .populate({
            path: 'vendorId',
            populate: { path: 'name', select: 'name email phoneNo' }
        });

    return res.status(200).json(
        new ApiResponse(200, shortlisted, "Shortlisted vendors retrieved")
    );
});

// Assign vendor to event
export const assignVendor = asyncHandler(async (req, res) => {
    const { vendorId, weddingId, role, budget, date } = req.body;

    if (!vendorId || !weddingId || !role || !budget || !date) {
        throw new ApiError(400, "All fields (vendorId, weddingId, role, budget, date) are required");
    }

    const plannerProfile = await Planner.findOne({ name: req.user._id });
    if (!plannerProfile) {
        throw new ApiError(404, "Planner profile not found");
    }

    const assignment = await VendorAssignment.create({
        plannerId: plannerProfile._id,
        vendorId,
        weddingId,
        role,
        budget,
        date: new Date(date),
        status: "Pending"
    });

    // Notify vendor using socket.io if online
    const io = req.app.get("io");
    if (io) {
        // Find vendor user ID
        const targetVendor = await Vendor.findById(vendorId);
        if (targetVendor) {
            io.to(targetVendor.name.toString()).emit("notification", {
                type: "assignment",
                message: `You have received a new assignment for ${role} from planner ${req.user.name}`,
                assignmentId: assignment._id
            });
        }
    }

    return res.status(201).json(
        new ApiResponse(201, assignment, "Vendor assigned to event. Request sent!")
    );
});

// Get assignments created by planner
export const getPlannerAssignments = asyncHandler(async (req, res) => {
    const plannerProfile = await Planner.findOne({ name: req.user._id });
    if (!plannerProfile) {
        throw new ApiError(404, "Planner profile not found");
    }

    const assignments = await VendorAssignment.find({ plannerId: plannerProfile._id })
        .populate({
            path: 'vendorId',
            populate: { path: 'name', select: 'name email phoneNo' }
        })
        .populate({
            path: 'weddingId',
            populate: { path: 'name', select: 'name email phoneNo' }
        })
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, assignments, "Assignments retrieved successfully")
    );
});

// Get assignments received by vendor
export const getVendorAssignments = asyncHandler(async (req, res) => {
    const vendorProfile = await Vendor.findOne({ name: req.user._id });
    if (!vendorProfile) {
        throw new ApiError(404, "Vendor profile not found");
    }

    const assignments = await VendorAssignment.find({ vendorId: vendorProfile._id })
        .populate({
            path: 'plannerId',
            populate: { path: 'name', select: 'name email phoneNo' }
        })
        .populate({
            path: 'weddingId',
            populate: { path: 'name', select: 'name email phoneNo' }
        })
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, assignments, "Assignments retrieved successfully")
    );
});

// Update assignment status by vendor
export const updateAssignmentStatus = asyncHandler(async (req, res) => {
    const { assignmentId } = req.params;
    const { status } = req.body;

    if (!status || !['Pending', 'Accepted', 'Rejected', 'Completed'].includes(status)) {
        throw new ApiError(400, "Valid status is required");
    }

    const assignment = await VendorAssignment.findById(assignmentId);
    if (!assignment) {
        throw new ApiError(404, "Assignment not found");
    }

    // Verify ownership
    const vendorProfile = await Vendor.findOne({ name: req.user._id });
    if (!vendorProfile || assignment.vendorId.toString() !== vendorProfile._id.toString()) {
        throw new ApiError(403, "You do not have permission to update this assignment");
    }

    assignment.status = status;
    await assignment.save();

    // Notify planner using Socket.io
    const io = req.app.get("io");
    if (io) {
        const targetPlanner = await Planner.findById(assignment.plannerId).populate("name");
        if (targetPlanner) {
            io.to(targetPlanner.name._id.toString()).emit("notification", {
                type: "assignment_update",
                message: `Vendor ${req.user.name} has ${status.toLowerCase()} your request for ${assignment.role}`,
                assignmentId: assignment._id
            });
        }
    }

    return res.status(200).json(
        new ApiResponse(200, assignment, `Assignment status updated to ${status}`)
    );
});

export const getVendorProfileMe = asyncHandler(async (req, res) => {
    const vendor = await Vendor.findOne({ $or: [{ name: req.user._id }, { userId: req.user._id }] })
        .populate("name", "name email phoneNo")
        .populate("userId", "name email phoneNo");

    if (!vendor) {
        throw new ApiError(404, "Vendor profile not found");
    }

    return res.status(200).json(
        new ApiResponse(200, vendor, "My vendor profile retrieved successfully")
    );
});

// Update vendor profile (availability status, business name, etc.)
export const updateVendorProfile = asyncHandler(async (req, res) => {
    const {
        name,
        email,
        phoneNo,
        businessName,
        availabilityStatus,
        location,
        priceRange,
        servicesOffered,
        experience,
        contactDetails,
        workingAreas,
        description,
        socialLinks,
        packages,
        vendorLogo,
        coverImage,
        vendorType
    } = req.body;

    const vendorProfile = await Vendor.findOne({ $or: [{ name: req.user._id }, { userId: req.user._id }] });
    if (!vendorProfile) {
        throw new ApiError(404, "Vendor profile not found");
    }

    const user = await User.findById(req.user._id);
    if (user) {
        if (name !== undefined) user.name = name;
        if (email !== undefined) user.email = email;
        if (phoneNo !== undefined) user.phoneNo = phoneNo;
        await user.save();
    }

    if (availabilityStatus !== undefined) {
        if (!['Available', 'Busy', 'Booked', 'Offline', 'Vacation'].includes(availabilityStatus)) {
            throw new ApiError(400, "Invalid availability status");
        }
        vendorProfile.availabilityStatus = availabilityStatus;
    }
    if (businessName !== undefined) vendorProfile.businessName = businessName;
    if (location !== undefined) vendorProfile.location = location;
    if (priceRange !== undefined) vendorProfile.priceRange = priceRange;
    if (servicesOffered !== undefined) vendorProfile.servicesOffered = servicesOffered;
    if (experience !== undefined) vendorProfile.experience = experience;
    if (contactDetails !== undefined) vendorProfile.contactDetails = contactDetails;
    if (workingAreas !== undefined) vendorProfile.workingAreas = workingAreas;
    if (description !== undefined) vendorProfile.description = description;
    if (socialLinks !== undefined) vendorProfile.socialLinks = socialLinks;
    if (packages !== undefined) vendorProfile.packages = packages;
    if (vendorLogo !== undefined) vendorProfile.vendorLogo = vendorLogo;
    if (coverImage !== undefined) vendorProfile.coverImage = coverImage;
    if (vendorType !== undefined) vendorProfile.vendorType = vendorType;

    await vendorProfile.save();

    // Broadcast availability status update using Socket.io
    const io = req.app.get("io");
    if (io) {
        io.emit("vendorStatusUpdate", {
            vendorId: vendorProfile._id,
            status: vendorProfile.availabilityStatus
        });
    }

    const updatedVendor = await Vendor.findById(vendorProfile._id)
        .populate("name", "name email phoneNo")
        .populate("userId", "name email phoneNo");

    return res.status(200).json(
        new ApiResponse(200, updatedVendor, "Vendor profile updated successfully")
    );
});

export const addVendorEvent = asyncHandler(async (req, res) => {
    const { name, eventType, plannerName, location, date, clientRating, images } = req.body;

    const vendorProfile = await Vendor.findOne({ $or: [{ name: req.user._id }, { userId: req.user._id }] });
    if (!vendorProfile) {
        throw new ApiError(404, "Vendor profile not found");
    }

    if (!name || !eventType || !location || !date) {
        throw new ApiError(400, "Event Name, Type, Location, and Date are required");
    }

    const newEvent = {
        name,
        eventType,
        plannerName: plannerName || "",
        location,
        date: new Date(date),
        clientRating: clientRating || 5,
        images: images || []
    };

    vendorProfile.previousEvents.push(newEvent);
    vendorProfile.completedEvents = (vendorProfile.completedEvents || 0) + 1;

    await vendorProfile.save();

    return res.status(201).json(
        new ApiResponse(201, vendorProfile, "Vendor past event added successfully")
    );
});

export const getVendorAnalytics = asyncHandler(async (req, res) => {
    const vendorProfile = await Vendor.findOne({ $or: [{ name: req.user._id }, { userId: req.user._id }] });
    if (!vendorProfile) {
        throw new ApiError(404, "Vendor profile not found");
    }

    const analytics = {
        profileViews: vendorProfile.profileViews || 95,
        quoteRequests: vendorProfile.quoteRequests || 12,
        bookingRequests: vendorProfile.bookingRequests || 8,
        averageRating: Number(vendorProfile.rating) || 5.0
    };

    return res.status(200).json(
        new ApiResponse(200, analytics, "Vendor analytics stats retrieved successfully")
    );
});
