import type { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../../../shared/catchAsync";
import sendResponse from "../../../../../shared/sendResponse";
import SettingsServices from "./settings.service";

// Get Basic Info
const getBasicInfo = catchAsync(async (req: Request, res: Response) => {
    const result = await SettingsServices.getBasicInfo(req.user);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.message,
        data: result.data,
    });
});

// Update Clinic Info
const updateClinicInfo = catchAsync(async (req: Request, res: Response) => {
    const result = await SettingsServices.updateClinicInfo(req.body, req.user);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.message,
        data: result.data,
    });
});

// Get Branding Info
const getBrandingInfo = catchAsync(async (req: Request, res: Response) => {
    const result = await SettingsServices.getBrandingInfo(req.user);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.message,
        data: result.data,
    });
});

// Update Branding Info
const updateBrandingInfo = catchAsync(async (req: Request, res: Response) => {
    const result = await SettingsServices.updateBrandingInfo(
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

// Export functions
export default {
    getBasicInfo,
    updateClinicInfo,
    getBrandingInfo,
    updateBrandingInfo,
};
