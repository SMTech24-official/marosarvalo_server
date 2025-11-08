import type { Request, Response } from "express";

import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import AdminServices, { FilterBy } from "./admin.service";

// Get Admin Dashboard Stats
const getAdminDashboardStats = catchAsync(
    async (req: Request, res: Response) => {
        const result = await AdminServices.getAdminDashboardStats(
            {filterBy: req.query.filterBy as FilterBy},
        );

        sendResponse(res, { 
            success: true,
            statusCode: httpStatus.OK,
            message: result.message,
            data: result.data,
        });
    },
);

// Create new Admin
const createNewAdmin = catchAsync(async (req: Request, res: Response) => {
    const result = await AdminServices.createNewAdmin(req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: result.message,
        data: result.data,
    });
});

// Get All Bookings
const getAllBookings = catchAsync(async (req: Request, res: Response) => {
    const result = await AdminServices.getAllBookings(req.query);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.message,
        data: result.data,
        pagination: result.pagination,
    });
});

// Get All Payments
const getAllPaymentHistory = catchAsync(async (req: Request, res: Response) => {
    const result = await AdminServices.getAllPaymentHistory(req.query);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.message,
        data: result.data,
        pagination: result.pagination,
    });
});

export default {
    getAdminDashboardStats,
    createNewAdmin,
    getAllBookings,
    getAllPaymentHistory,
};
