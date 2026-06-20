import Notification from "../models/notification.models.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

// Get list of notifications for current user
export const getMyNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ recipient: req.user._id })
        .sort({ createdAt: -1 })
        .limit(50);

    return res.status(200).json(
        new ApiResponse(200, notifications, "Notifications retrieved successfully")
    );
});

// Mark notification as read
export const markNotificationAsRead = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const notification = await Notification.findById(id);
    if (!notification) {
        throw new ApiError(404, "Notification not found");
    }

    if (notification.recipient.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You do not have permission to access this notification");
    }

    notification.read = true;
    await notification.save();

    return res.status(200).json(
        new ApiResponse(200, notification, "Notification marked as read")
    );
});
