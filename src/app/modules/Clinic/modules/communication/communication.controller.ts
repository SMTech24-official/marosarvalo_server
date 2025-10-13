import type { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../../../shared/catchAsync";
import sendResponse from "../../../../../shared/sendResponse";
import CommunicationServices from "./communication.service";

// Create Reminder Schedules
const createReminderSchedules = catchAsync(
    async (req: Request, res: Response) => {
        const result = await CommunicationServices.createReminderSchedules(
            req.body,
            req.user
        );
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.CREATED,
            message: result.message,
            data: result.data,
        });
    }
);

// Get History
const getReminderScheduleHistory = catchAsync(
    async (req: Request, res: Response) => {
        const result = await CommunicationServices.getReminderScheduleHistory(
            req.query,
            req.user
        );
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: result.message,
            data: result.data,
            pagination: result.pagination,
        });
    }
);

// Export all functions
export default {
    createReminderSchedules,
    getReminderScheduleHistory,
};
