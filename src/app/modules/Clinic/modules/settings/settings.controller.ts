import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../../../shared/catchAsync";
import sendResponse from "../../../../../shared/sendResponse";
import SettingsServices from "./settings.service";
import config from "../../../../../config";

// Get Basic Info
const getBasicInfo = catchAsync(async (req: Request, res: Response) => {
    const result = await SettingsServices.getBasicInfo(req.user);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: result.message,
        data: result.data,
    });
});

// Update Clinic Info
const updateClinicInfo = catchAsync(async (req: Request, res: Response) => {
    const result = await SettingsServices.updateClinicInfo(req.body, req.user);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: result.message,
        data: result.data,
    });
});

// Get Branding Info
const getBrandingInfo = catchAsync(async (req: Request, res: Response) => {
    const result = await SettingsServices.getBrandingInfo(req.user);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: result.message,
        data: result.data,
    });
});

// Update Branding Info
const updateBrandingInfo = catchAsync(async (req: Request, res: Response) => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const logo = files.logo?.[0];
    const signature = files.signature?.[0];

    req.body.logo = `${config.uploads_url}/${logo.filename}`;
    req.body.signature = `${config.uploads_url}/${signature.filename}`;

    const result = await SettingsServices.updateBrandingInfo(
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

// Export functions
export default {
    getBasicInfo,
    updateClinicInfo,
    getBrandingInfo,
    updateBrandingInfo,
};
