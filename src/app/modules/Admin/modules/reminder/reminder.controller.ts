import type { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../../../shared/catchAsync";
import sendResponse from "../../../../../shared/sendResponse";
import ReminderServices from "./reminder.service";

// Send Reminder
const sendReminder = catchAsync(async (req: Request, res: Response) => {
    const result = await ReminderServices.sendReminder(req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.message,
        data: result.data,
    });
});

// Get All Reminders
const getReminders = catchAsync(async (req: Request, res: Response) => {
    const result = await ReminderServices.getReminders(req.query);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.message,
        data: result.data,
        pagination: result.pagination,
    });
});

export default {
    sendReminder,
    getReminders,
};
