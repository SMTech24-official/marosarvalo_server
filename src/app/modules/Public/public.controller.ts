import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import PublicServices from "./public.service";

// Get Active Packages
const getActivePackages = catchAsync(async (req: Request, res: Response) => {
    const result = await PublicServices.getActivePackages();

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: result.message,
        data: result.data,
    });
});

export default { getActivePackages };
