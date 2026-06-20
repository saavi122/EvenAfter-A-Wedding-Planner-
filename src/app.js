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

const app = express();

// Middlewares
app.use(cors({
    origin: true, // Allow frontend origin
    credentials: true
}));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// Api Routes
app.use("/api/auth", authRouter);
app.use("/api/planners", plannerRouter);
app.use("/api/client", clientRouter);
app.use("/api/meetings", meetingRouter);
app.use("/api/planner-requests", plannerRequestRouter);
app.use("/api/chat", chatRouter);
app.use("/api/vendors", vendorRouter);
app.use("/api/vendor-assignments", vendorAssignmentRouter);

// Global Error Handler
app.use(errorMiddleware);

export default app;