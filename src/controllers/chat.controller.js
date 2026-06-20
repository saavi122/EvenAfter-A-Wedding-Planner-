import ChatMessage from "../models/chatMessage.models.js";
import User from "../models/user.models.js";
import Client from "../models/client.models.js";
import Planner from "../models/planner.models.js";
import Vendor from "../models/vendor.models.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getChatMessages = asyncHandler(async (req, res) => {
    const { receiverId } = req.params;
    const senderId = req.user._id;

    // Find the receiver user
    let receiverQuery = {};
    if (receiverId.match(/^[0-9a-fA-F]{24}$/)) {
        receiverQuery = { _id: receiverId };
    } else {
        // Look up by plannerId or clientId if receiverId is user friendly string
        // Let's fallback to checking user by ID or username
        receiverQuery = { _id: receiverId };
    }

    const receiver = await User.findOne(receiverQuery);
    if (!receiver) {
        throw new ApiError(404, "Recipient user not found");
    }

    // Find all messages between sender and receiver
    const messages = await ChatMessage.find({
        $or: [
            { sender: senderId, receiver: receiver._id },
            { sender: receiver._id, receiver: senderId }
        ]
    }).sort({ createdAt: 1 });

    // Mark received messages as read
    await ChatMessage.updateMany(
        { sender: receiver._id, receiver: senderId, read: false },
        { $set: { read: true } }
    );

    return res.status(200).json(
        new ApiResponse(200, messages, "Messages retrieved successfully")
    );
});

export const sendChatMessage = asyncHandler(async (req, res) => {
    const { receiverId } = req.params;
    const { message, image, file } = req.body;
    const senderId = req.user._id;

    if (!message && !image && !file) {
        throw new ApiError(400, "Cannot send empty message");
    }

    let receiverQuery = {};
    if (receiverId.match(/^[0-9a-fA-F]{24}$/)) {
        receiverQuery = { _id: receiverId };
    } else {
        receiverQuery = { _id: receiverId };
    }

    const receiver = await User.findOne(receiverQuery);
    if (!receiver) {
        throw new ApiError(404, "Recipient user not found");
    }

    const chatMsg = await ChatMessage.create({
        sender: senderId,
        receiver: receiver._id,
        message,
        image,
        file,
        read: false
    });

    const io = req.app.get("io");
    if (io) {
        io.to(receiver._id.toString()).emit("messageReceived", chatMsg);
        io.to(receiver._id.toString()).emit("notification", {
            type: "message",
            sender: senderId,
            message: message || "Sent an attachment"
        });
    }

    return res.status(201).json(
        new ApiResponse(201, chatMsg, "Message sent successfully")
    );
});

export const getConversations = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Find all messages sent or received by user
    const messages = await ChatMessage.find({
        $or: [
            { sender: userId },
            { receiver: userId }
        ]
    }).sort({ createdAt: -1 });

    // Extract unique conversation partners
    const partnersMap = new Map();
    for (const msg of messages) {
        const partnerId = msg.sender.toString() === userId.toString() ? msg.receiver.toString() : msg.sender.toString();
        if (!partnersMap.has(partnerId)) {
            partnersMap.set(partnerId, msg);
        }
    }

    const conversations = [];
    for (const [partnerId, lastMsg] of partnersMap.entries()) {
        const partnerUser = await User.findById(partnerId).select("name email role phoneNo");
        if (!partnerUser) continue;

        // Fetch their role profile (client, planner, or vendor details)
        let profile = null;
        if (partnerUser.role === "client") {
            profile = await Client.findOne({ name: partnerId });
        } else if (partnerUser.role === "planner") {
            profile = await Planner.findOne({ name: partnerId });
        } else if (partnerUser.role === "vendor") {
            profile = await Vendor.findOne({ name: partnerId });
        }

        conversations.push({
            user: partnerUser,
            profile,
            lastMessage: lastMsg.message,
            lastMessageTime: lastMsg.createdAt,
            unreadCount: await ChatMessage.countDocuments({
                sender: partnerId,
                receiver: userId,
                read: false
            })
        });
    }

    return res.status(200).json(
        new ApiResponse(200, conversations, "Conversations retrieved successfully")
    );
});
