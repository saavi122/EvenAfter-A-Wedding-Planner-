import Invoice from "../models/invoice.models.js";
import User from "../models/user.models.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// 1. Create a new invoice (handles both logged-in and guest checkouts)
export const createInvoice = asyncHandler(async (req, res) => {
  const {
    invoiceNumber,
    userName,
    userEmail,
    userPhone,
    planName,
    amountPaid,
    gst,
    totalAmount,
    paymentMethod,
    isYearly,
    transactionId
  } = req.body;

  if (!invoiceNumber || !userName || !userEmail || !userPhone || !planName || amountPaid === undefined || !paymentMethod) {
    throw new ApiError(400, "Required checkout fields are missing");
  }

  // Check if invoice number is unique
  const existingInvoice = await Invoice.findOne({ invoiceNumber });
  if (existingInvoice) {
    throw new ApiError(409, "Invoice number already exists");
  }

  let userId = null;
  
  // If user is authenticated, link invoice and upgrade plan immediately
  if (req.user) {
    userId = req.user._id;

    // Calculate dates
    const startDate = new Date();
    const durationDays = isYearly ? 365 : 30;
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + durationDays);

    // Update user profile
    await User.findByIdAndUpdate(userId, {
      plan: planName,
      planStartDate: startDate,
      planEndDate: endDate,
      subscriptionStatus: 'active'
    });
  }

  // Create invoice record
  const invoice = await Invoice.create({
    invoiceNumber,
    userId,
    userName,
    userEmail,
    userPhone,
    planName,
    amountPaid,
    gst,
    totalAmount,
    paymentMethod,
    paymentStatus: 'Paid',
    transactionId
  });

  return res.status(201).json(
    new ApiResponse(201, invoice, "Invoice generated successfully")
  );
});

// 2. Fetch invoice history for the current logged-in user
export const getMyInvoices = asyncHandler(async (req, res) => {
  const invoices = await Invoice.find({
    $or: [
      { userId: req.user._id },
      { userEmail: req.user.email }
    ]
  }).sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, invoices, "Personal invoices retrieved successfully")
  );
});

// 3. Fetch all subscriptions and invoices for the Admin Panel
export const getAdminInvoices = asyncHandler(async (req, res) => {
  const invoices = await Invoice.find({})
    .populate("userId", "name email role plan subscriptionStatus")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, invoices, "All platform invoices retrieved successfully")
  );
});

// 4. Fetch billing analytics for the Admin dashboard
export const getBillingAnalytics = asyncHandler(async (req, res) => {
  const invoices = await Invoice.find({});
  
  // Calculate total revenue
  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  
  // Calculate plan counts
  const plansStats = await User.aggregate([
    {
      $group: {
        _id: "$plan",
        count: { $sum: 1 }
      }
    }
  ]);

  const planBreakdown = {};
  plansStats.forEach(stat => {
    planBreakdown[stat._id || 'Free'] = stat.count;
  });

  // Calculate active paid subscriptions
  const activePaidSubscriptions = await User.find({
    plan: { $ne: 'Free' },
    subscriptionStatus: 'active'
  }).select("name email role plan planStartDate planEndDate");

  return res.status(200).json(
    new ApiResponse(200, {
      totalRevenue,
      planBreakdown,
      activePaidSubscriptionsCount: activePaidSubscriptions.length,
      activePaidSubscriptions,
      totalInvoicesCount: invoices.length
    }, "Billing analytics compiled successfully")
  );
});
