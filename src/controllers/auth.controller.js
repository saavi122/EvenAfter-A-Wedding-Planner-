import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.models.js";
import Client from "../models/client.models.js";
import Planner from "../models/planner.models.js";
import Vendor from "../models/vendor.models.js";
import Portfolio from "../models/portfolio.models.js";
import Invoice from "../models/invoice.models.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const generateToken = (userId) => {
    return jwt.sign(
        { _id: userId },
        process.env.JWT_SECRET || process.env.ACCESS_TOKEN_SECRET || "your_super_secret_jwt_key_here",
        { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );
};

export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, phone, password, role, plan } = req.body;

    if (!name || !email || !phone || !password || !role) {
        throw new ApiError(400, "All fields (name, email, phone, password, role) are required");
    }

    const existedUser = await User.findOne({ email });
    if (existedUser) {
        throw new ApiError(409, "User with this email already exists");
    }

    // Determine initial subscription plan
    let initialPlan = plan || "Free";
    let planStartDate = new Date();
    let planEndDate = null;

    // Check if there is an existing guest invoice for this email
    const guestInvoice = await Invoice.findOne({ userEmail: email }).sort({ createdAt: -1 });
    if (guestInvoice) {
        initialPlan = guestInvoice.planName;
        planStartDate = guestInvoice.createdAt;
        const isYearly = guestInvoice.planName.toLowerCase().includes('year') || guestInvoice.totalAmount > 5000;
        const durationDays = isYearly ? 365 : 30;
        planEndDate = new Date(planStartDate);
        planEndDate.setDate(planEndDate.getDate() + durationDays);
    } else if (initialPlan !== "Free") {
        const durationDays = initialPlan.toLowerCase().includes('year') ? 365 : 30;
        planEndDate = new Date();
        planEndDate.setDate(planEndDate.getDate() + durationDays);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        name,
        email,
        phoneNo: phone,
        password: hashedPassword,
        role,
        plan: initialPlan,
        planStartDate,
        planEndDate,
        subscriptionStatus: "active"
    });

    // If a guest invoice was found, associate it with the new user's ID
    if (guestInvoice) {
        guestInvoice.userId = user._id;
        await guestInvoice.save();
    }

    // Create role-specific documents
    if (role === "client") {
        await Client.create({
            name: user._id,
            email: user._id,
            clientRole: user._id,
            userId: user._id,
            EventIdName: "My Wedding",
            venue: "To Be Decided",
            budget: 0,
            timelineAccess: "Granted",
            clientId: "CLI-" + Math.floor(100000 + Math.random() * 900000)
        });
    } else if (role === "planner") {
        const planner = await Planner.create({
            name: user._id,
            email: user._id,
            plannerRole: user._id,
            userId: user._id,
            companyName: "Elite Wedding Co.",
            specialiazation: "Luxury Royal & Destination Weddings",
            assignedEvents: "0",
            exprience: "1 Year",
            ratings: 5,
            status: "active",
            plannerId: "PLN-" + Math.floor(100000 + Math.random() * 900000)
        });

        // Initialize empty Portfolio
        await Portfolio.create({
            plannerId: planner._id,
            images: [],
            videos: [],
            testimonials: []
        });
    } else if (role === "vendor") {
        await Vendor.create({
            name: user._id,
            email: user._id,
            VendorRole: user._id,
            userId: user._id,
            businessName: "Premium Wedding Services",
            vendorType: "Florist",
            rating: "5.0",
            experience: "1 Year",
            location: "Goa",
            availabilityStatus: "Available",
            vendorId: "VND-" + Math.floor(100000 + Math.random() * 900000),
            status: "active"
        });
    }

    const createdUser = await User.findById(user._id).select("-password");

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
});

export const loginUser = asyncHandler(async (req, res) => {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
        throw new ApiError(400, "Email, password, and role are required");
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    if (user.role !== role) {
        throw new ApiError(403, `You are registered as a ${user.role}, not a ${role}`);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const token = generateToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password");

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    };

    return res
        .status(200)
        .cookie("accessToken", token, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    token
                },
                "User logged in successfully"
            )
        );
});

export const logoutUser = asyncHandler(async (req, res) => {
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

export const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password");
    let roleProfile = null;

    if (user.role === 'client') {
        roleProfile = await Client.findOne({ name: user._id });
    } else if (user.role === 'planner') {
        roleProfile = await Planner.findOne({ name: user._id });
    } else if (user.role === 'vendor') {
        roleProfile = await Vendor.findOne({ name: user._id });
    }

    return res.status(200).json(
        new ApiResponse(200, { user, profile: roleProfile }, "User session fetched")
    );
});

export const getUserById = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const userDetail = await User.findById(userId).select("name email role phoneNo");
    if (!userDetail) {
        throw new ApiError(404, "User not found");
    }

    let profile = null;
    if (userDetail.role === "client") {
        profile = await Client.findOne({ name: userId });
    } else if (userDetail.role === "planner") {
        profile = await Planner.findOne({ name: userId });
    } else if (userDetail.role === "vendor") {
        profile = await Vendor.findOne({ name: userId });
    }

    return res.status(200).json(
        new ApiResponse(200, { user: userDetail, profile }, "User profile retrieved successfully")
    );
});

export const toggleAutoRenew = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    user.autoRenew = !user.autoRenew;
    await user.save();
    return res.status(200).json(
        new ApiResponse(200, { autoRenew: user.autoRenew }, "Auto-renew status toggled successfully")
    );
});
