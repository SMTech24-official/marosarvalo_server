import type { Request, Response } from "express";
import catchAsync from "../../../../../shared/catchAsync";
import sendResponse from "../../../../../shared/sendResponse";
import ReminderServices from "./reminder.service";
import { ActivityStatus } from "@prisma/client";
import { StatusCodes } from "http-status-codes";

// Create Reminder Schedules
const createReminderSchedules = catchAsync(
    async (req: Request, res: Response) => {
        const result = await ReminderServices.createReminderSchedules(
            req.body,
            req.user,
        );

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.CREATED,
            message: result.message,
            data: result.data,
        });
    },
);

// Get Reminder Schedules
const getReminderSchedules = catchAsync(async (req: Request, res: Response) => {
    const result = await ReminderServices.getReminderSchedules(req.user);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: result.message,
        data: result.data,
    });
});

// Update Reminder Schedule
const updateSchedule = catchAsync(async (req: Request, res: Response) => {
    const scheduleId = req.params.id;
    const result = await ReminderServices.updateSchedule(
        scheduleId,
        req.body,
        req.user,
    );

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: result.message,
        data: result.data,
    });
});

// Delete Reminder Schedule
const deleteSchedule = catchAsync(async (req: Request, res: Response) => {
    const scheduleId = req.params.id;
    const result = await ReminderServices.deleteSchedule(scheduleId, req.user);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: result.message,
        data: result.data,
    });
});

// Update Reminder Status
const updateReminderStatus = catchAsync(async (req: Request, res: Response) => {
    const scheduleId = req.params.id;
    const status = req.params.status;

    if (
        !Object.values(ActivityStatus).includes(
            status?.toUpperCase() as ActivityStatus,
        )
    ) {
        res.status(StatusCodes.NOT_FOUND);
    }

    const result = await ReminderServices.updateReminderStatus(
        scheduleId,
        status as ActivityStatus,
        req.user,
    );
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: result.message,
        data: result.data,
    });
});

// Get History
const getReminderScheduleHistory = catchAsync(
    async (req: Request, res: Response) => {
        const result = await ReminderServices.getReminderScheduleHistory(
            req.query,
            req.user,
        );

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: result.message,
            data: result.data,
            pagination: result.pagination,
        });
    },
);

// Export all functions
export default {
    createReminderSchedules,
    getReminderSchedules,
    updateSchedule,
    deleteSchedule,
    updateReminderStatus,
    getReminderScheduleHistory,
};
