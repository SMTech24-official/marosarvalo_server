import type { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../../../shared/catchAsync";
import sendResponse from "../../../../../shared/sendResponse";
import StaffServices from "./staff.service";
import { getValidatedIntId } from "../../../../../utils";

// Create New Staff
const createNewStaff = catchAsync(async (req: Request, res: Response) => {
    const result = await StaffServices.createNewStaff(req.body, req.user);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: result.message,
        data: result.data,
    });
});

// Get All Staff
const getAllStaff = catchAsync(async (req: Request, res: Response) => {
    const result = await StaffServices.getAllStaff(req.query, req.user);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.message,
        data: result.data,
        pagination: result.pagination,
    });
});

// Get Staff by Id
const getStaffById = catchAsync(async (req: Request, res: Response) => {
    const id = getValidatedIntId(req.params.id);

    const result = await StaffServices.getStaffById(id, req.user);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.message,
        data: result.data,
    });
});

// Update Staff data
const updateStaffData = catchAsync(async (req: Request, res: Response) => {
    const id = getValidatedIntId(req.params.id);

    const result = await StaffServices.updateStaffData(id, req.body, req.user);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.message,
        data: result.data,
    });
});

// Delete Staff data
const deleteStaffData = catchAsync(async (req: Request, res: Response) => {
    const id = getValidatedIntId(req.params.id);

    const result = await StaffServices.deleteStaffData(id, req.user);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.message,
        data: result.data,
    });
});

// Update Staff Working Hours
const updateWorkingHours = catchAsync(async (req: Request, res: Response) => {
    const id = getValidatedIntId(req.params.id);

    const result = await StaffServices.updateWorkingHours(
        id,
        req.body,
        req.user
    );
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.message,
        data: result.data,
    });
});

// Insert Staff Holiday
const insertHoliday = catchAsync(async (req: Request, res: Response) => {
    const id = getValidatedIntId(req.params.id);

    const result = await StaffServices.insertHoliday(id, req.body, req.user);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.message,
        data: result.data,
    });
});

// Get Staff Schedules
const getStaffSchedules = catchAsync(async (req: Request, res: Response) => {
    const clientTimezone = req.headers["x-client-timezone"] || "UTC";

    const result = await StaffServices.getStaffSchedules(
        clientTimezone as string,
        req.user
    );
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.message,
        data: result.data,
    });
});

// Export all functions
export default {
    createNewStaff,
    getAllStaff,
    getStaffById,
    updateStaffData,
    deleteStaffData,
    updateWorkingHours,
    insertHoliday,
    getStaffSchedules,
};
