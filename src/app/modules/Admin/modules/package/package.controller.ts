import { Request, Response } from "express";
import catchAsync from "../../../../../shared/catchAsync";
import sendResponse from "../../../../../shared/sendResponse";
import httpStatus from "http-status";
import PackageServices from "./package.service";

// Create Package
const createPackage = catchAsync(async (req: Request, res: Response) => {
    const result = await PackageServices.createPackage(req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: result.message,
        data: result.data,
    });
});

// Get All Packages
const getAllPackages = catchAsync(async (req: Request, res: Response) => {
    const result = await PackageServices.getAllPackages();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: result.message,
        data: result.data,
    });
});

// Get Single Package
const getSinglePackage = catchAsync(async (req: Request, res: Response) => {
    const result = await PackageServices.getSinglePackage(req.params.id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: result.message,
        data: result.data,
    });
});

// Update Package
const updatePackage = catchAsync(async (req: Request, res: Response) => {
    const result = await PackageServices.updatePackage(req.params.id, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: result.message,
        data: result.data,
    });
});

// Delete Package
const deletePackage = catchAsync(async (req: Request, res: Response) => {
    const result = await PackageServices.deletePackage(req.params.id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: result.message,
        data: result.data,
    });
});

export default {
    createPackage,
    getAllPackages,
    getSinglePackage,
    updatePackage,
    deletePackage,
};
