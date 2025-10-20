import type { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../../../shared/catchAsync";
import sendResponse from "../../../../../shared/sendResponse";
import ServiceServices from "./services.service";
import { getValidatedIntId } from "../../../../../utils";

// Get Services Statistics
const getServicesStatistics = catchAsync(
    async (req: Request, res: Response) => {
        const result = await ServiceServices.getServicesStatistics(req.user);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: result.message,
            data: result.data,
        });
    }
);

// Get Services List
const getServices = catchAsync(async (req: Request, res: Response) => {
    const result = await ServiceServices.getServices(req.query, req.user);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.message,
        data: result.data,
        pagination: result.pagination,
    });
});

// Create Service
const createService = catchAsync(async (req: Request, res: Response) => {
    const result = await ServiceServices.createService(req.body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: result.message,
        data: result.data,
    });
});

// Update Service
const updateService = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;

    const result = await ServiceServices.updateService(id, req.body, req.user);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.message,
        data: result.data,
    });
});

// Delete Service
const deleteService = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;

    const result = await ServiceServices.deleteService(id, req.user);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.message,
        data: result.data,
    });
});

// Export all functions
export default {
    getServicesStatistics,
    getServices,
    createService,
    updateService,
    deleteService,
};
