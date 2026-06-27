import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import errorMiddleware from './middlewares/error.middleware.js';

// Route Imports
import authRouter from './routes/user.routes.js';
import plannerRouter from './routes/planner.routes.js';
import clientRouter from './routes/client.routes.js';
import meetingRouter from './routes/meeting.routes.js';
import plannerRequestRouter from './routes/plannerRequest.routes.js';
import chatRouter from './routes/chat.routes.js';
import vendorRouter from './routes/vendor.routes.js';
import vendorAssignmentRouter from './routes/vendorAssignment.routes.js';
import eventRouter from './routes/event.routes.js';
import taskRouter from './routes/task.routes.js';
import timelineRouter from './routes/timeline.routes.js';
import documentRouter from './routes/document.routes.js';
import notificationRouter from './routes/notification.routes.js';
import adminRouter from './routes/admin.routes.js';
import invoiceRouter from './routes/invoice.routes.js';
import aiRouter from './routes/ai.routes.js';

const app = express();

// Middlewares
app.use(cors({
    origin: true, // Allow frontend origin
    credentials: true
}));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// Root route
app.get("/", (req, res) => {
    res.json({ message: "VendorNet Backend API is running successfully!" });
});

// Api Routes
app.use("/api/auth", authRouter);
app.use("/api/planners", plannerRouter);
app.use("/api/client", clientRouter);
app.use("/api/meetings", meetingRouter);
app.use("/api/planner-requests", plannerRequestRouter);
app.use("/api/chat", chatRouter);
app.use("/api/vendors", vendorRouter);
app.use("/api/vendor-assignments", vendorAssignmentRouter);
app.use("/api/events", eventRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/timelines", timelineRouter);
app.use("/api/documents", documentRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/admin", adminRouter);
app.use("/api/invoices", invoiceRouter);
app.use("/api/ai", aiRouter);

// Global Error Handler
app.use(errorMiddleware);

export default app;