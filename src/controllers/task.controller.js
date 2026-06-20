import Task from "../models/task.models.js";
import WeddingEvent from "../models/weddingEvent.models.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// Get tasks for event
export const getWeddingTasks = asyncHandler(async (req, res) => {
    const { eventId } = req.params;

    const weddingEvent = await WeddingEvent.findById(eventId);
    if (!weddingEvent) {
        throw new ApiError(404, "Wedding Event not found");
    }

    const tasks = await Task.find({ eventId }).sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, tasks, "Tasks retrieved successfully")
    );
});

// Create task for event
export const createWeddingTask = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const { title, description, dueDate } = req.body;

    if (!title) {
        throw new ApiError(400, "Task title is required");
    }

    const weddingEvent = await WeddingEvent.findById(eventId);
    if (!weddingEvent) {
        throw new ApiError(404, "Wedding Event not found");
    }

    const task = await Task.create({
        eventId,
        title,
        description,
        status: "Pending",
        dueDate: dueDate ? new Date(dueDate) : null
    });

    return res.status(201).json(
        new ApiResponse(201, task, "Task created successfully")
    );
});

// Update task completion status
export const updateTaskStatus = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const { status } = req.body;

    if (!status || !['Pending', 'Completed'].includes(status)) {
        throw new ApiError(400, "Valid status is required");
    }

    const task = await Task.findById(taskId);
    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    task.status = status;
    await task.save();

    return res.status(200).json(
        new ApiResponse(200, task, "Task status updated successfully")
    );
});
