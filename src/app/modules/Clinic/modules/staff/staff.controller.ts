import type { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../../../shared/catchAsync";
import sendResponse from "../../../../../shared/sendResponse";
import StaffServices from "./staff.service";

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
    const result = await StaffServices.getStaffById(req.params.id, req.user);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.message,
        data: result.data,
    });
});

// Update Staff data
const updateStaffData = catchAsync(async (req: Request, res: Response) => {
    const result = await StaffServices.updateStaffData(
        req.params.id,
        req.body,
        req.user,
    );
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.message,
        data: result.data,
    });
});

// Delete Staff data
const deleteStaffData = catchAsync(async (req: Request, res: Response) => {
    const result = await StaffServices.deleteStaffData(req.params.id, req.user);
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
        req.user,
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
    getStaffSchedules,
};
