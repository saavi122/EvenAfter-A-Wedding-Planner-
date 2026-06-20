import User from "../models/user.models.js";
import Client from "../models/client.models.js";
import Planner from "../models/planner.models.js";
import Vendor from "../models/vendor.models.js";
import WeddingEvent from "../models/weddingEvent.models.js";
import Notification from "../models/notification.models.js";
import AuditLog from "../models/auditLog.models.js";
import FAQ from "../models/faq.models.js";
import Testimonial from "../models/testimonial.models.js";
import Gallery from "../models/gallery.models.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// Helper function to create audit log
const logAction = async (action, actorId, details) => {
    try {
        await AuditLog.create({ action, actor: actorId, details });
    } catch (e) {
        console.error("Audit logging error:", e);
    }
};

// 1. Get list of all platform users
export const getAdminUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    return res.status(200).json(
        new ApiResponse(200, users, "Users retrieved successfully")
    );
});

// 2. Update status (suspend/activate) of user accounts
export const updateUserStatus = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { status } = req.body; // e.g. "active" or "suspended"

    if (!status || !['active', 'suspended'].includes(status)) {
        throw new ApiError(400, "Valid status ('active' or 'suspended') is required");
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    user.status = status;
    await user.save();

    // Sync status with their specific profile if they are planner or vendor
    if (user.role === 'planner') {
        await Planner.findOneAndUpdate({ name: userId }, { status });
    } else if (user.role === 'vendor') {
        await Vendor.findOneAndUpdate({ name: userId }, { status });
    }

    await logAction(`Account Status Changed to ${status}`, req.user._id, `Updated user ${user.email} status to ${status}`);

    return res.status(200).json(
        new ApiResponse(200, user, `User status updated to ${status}`)
    );
});

// 3. Delete a user account
export const deleteUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Delete role-specific document
    if (user.role === 'client') {
        await Client.deleteOne({ name: userId });
    } else if (user.role === 'planner') {
        await Planner.deleteOne({ name: userId });
    } else if (user.role === 'vendor') {
        await Vendor.deleteOne({ name: userId });
    }

    // Delete base user record
    await User.findByIdAndDelete(userId);

    await logAction("Account Deleted", req.user._id, `Deleted user ${user.email} (${user.role})`);

    return res.status(200).json(
        new ApiResponse(200, {}, "User account deleted successfully")
    );
});

// 4. Get list of pending vendor registrations (unverified / inactive status)
export const getPendingVendors = asyncHandler(async (req, res) => {
    const pendingVendors = await Vendor.find({ status: "pending" })
        .populate("name", "name email phoneNo")
        .populate("userId", "name email phoneNo");

    return res.status(200).json(
        new ApiResponse(200, pendingVendors, "Pending vendors retrieved successfully")
    );
});

// 5. Approve/decline vendor accounts
export const approveVendorStatus = asyncHandler(async (req, res) => {
    const { vendorId } = req.params;
    const { isApproved } = req.body; // true or false

    const vendorProfile = await Vendor.findById(vendorId).populate("name");
    if (!vendorProfile) {
        throw new ApiError(404, "Vendor profile not found");
    }

    const newStatus = isApproved ? "active" : "suspended";
    vendorProfile.status = newStatus;
    await vendorProfile.save();

    // Sync status with main user account
    if (vendorProfile.name) {
        await User.findByIdAndUpdate(vendorProfile.name._id, { status: newStatus });
    }

    await logAction(
        isApproved ? "Vendor Approved" : "Vendor Rejected",
        req.user._id,
        `Vendor ${vendorProfile.businessName} was ${isApproved ? 'approved' : 'rejected'}`
    );

    return res.status(200).json(
        new ApiResponse(200, vendorProfile, `Vendor verified and status set to ${newStatus}`)
    );
});

// 6. View platform statistics / analytics
export const getAnalyticsStats = asyncHandler(async (req, res) => {
    const clientsCount = await User.countDocuments({ role: "client" });
    const plannersCount = await User.countDocuments({ role: "planner" });
    const vendorsCount = await User.countDocuments({ role: "vendor" });
    const activeWeddingsCount = await WeddingEvent.countDocuments({ status: "Ongoing" });
    const totalWeddingsCount = await WeddingEvent.countDocuments({});

    // Simple revenue aggregation
    const weddings = await WeddingEvent.find({});
    const totalBudgetSum = weddings.reduce((acc, curr) => acc + (curr.budget || 0), 0);
    const estimatedPlatformCommission = totalBudgetSum * 0.05; // 5% platform fee

    return res.status(200).json(
        new ApiResponse(200, {
            clientsCount,
            plannersCount,
            vendorsCount,
            activeWeddingsCount,
            totalWeddingsCount,
            totalBudgetSum,
            estimatedPlatformCommission
        }, "Platform statistics compiled successfully")
    );
});

// 7. Broadcast notification to all active users
export const broadcastNotification = asyncHandler(async (req, res) => {
    const { message } = req.body;

    if (!message) {
        throw new ApiError(400, "Broadcast message content is required");
    }

    const users = await User.find({ status: "active" });
    const notifications = users.map(user => ({
        recipient: user._id,
        sender: req.user._id,
        message,
        type: "broadcast"
    }));

    await Notification.insertMany(notifications);

    // Send real-time updates via Socket.io
    const io = req.app.get("io");
    if (io) {
        io.emit("notification", {
            type: "broadcast",
            message
        });
    }

    await logAction("Global Broadcast Sent", req.user._id, `Broadcasted: "${message}"`);

    return res.status(201).json(
        new ApiResponse(201, {}, "Broadcast sent successfully to all active accounts")
    );
});

// 8. View Platform Operations Audit Trails
export const getAuditLogs = asyncHandler(async (req, res) => {
    const logs = await AuditLog.find({})
        .populate("actor", "name email role")
        .sort({ createdAt: -1 })
        .limit(100);

    return res.status(200).json(
        new ApiResponse(200, logs, "Audit logs retrieved successfully")
    );
});

// 9. Manage FAQ CRUD
export const getFAQs = asyncHandler(async (req, res) => {
    const faqs = await FAQ.find({}).sort({ createdAt: -1 });
    return res.status(200).json(new ApiResponse(200, faqs, "FAQs retrieved"));
});

export const createFAQ = asyncHandler(async (req, res) => {
    const { question, answer } = req.body;
    if (!question || !answer) throw new ApiError(400, "Question and answer are required");
    const faq = await FAQ.create({ question, answer });
    return res.status(201).json(new ApiResponse(201, faq, "FAQ created"));
});

export const deleteFAQ = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await FAQ.findByIdAndDelete(id);
    return res.status(200).json(new ApiResponse(200, {}, "FAQ deleted"));
});

// 10. Manage Testimonial CRUD
export const getTestimonials = asyncHandler(async (req, res) => {
    const testimonials = await Testimonial.find({}).sort({ createdAt: -1 });
    return res.status(200).json(new ApiResponse(200, testimonials, "Testimonials retrieved"));
});

export const createTestimonial = asyncHandler(async (req, res) => {
    const { clientName, reviewText, rating, imageUrl } = req.body;
    if (!clientName || !reviewText || !rating) throw new ApiError(400, "Fields missing");
    const test = await Testimonial.create({ clientName, reviewText, rating, imageUrl });
    return res.status(201).json(new ApiResponse(201, test, "Testimonial created"));
});

export const deleteTestimonial = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await Testimonial.findByIdAndDelete(id);
    return res.status(200).json(new ApiResponse(200, {}, "Testimonial deleted"));
});

// 11. Manage Gallery CRUD
export const getGallery = asyncHandler(async (req, res) => {
    const galleryItems = await Gallery.find({}).sort({ createdAt: -1 });
    return res.status(200).json(new ApiResponse(200, galleryItems, "Gallery items retrieved"));
});

export const createGalleryItem = asyncHandler(async (req, res) => {
    const { imageUrl, title, category } = req.body;
    if (!imageUrl || !title) throw new ApiError(400, "Image URL and title are required");
    const item = await Gallery.create({ imageUrl, title, category });
    return res.status(201).json(new ApiResponse(201, item, "Gallery item created"));
});

export const deleteGalleryItem = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await Gallery.findByIdAndDelete(id);
    return res.status(200).json(new ApiResponse(200, {}, "Gallery item deleted"));
});
