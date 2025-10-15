import type { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../../../shared/catchAsync";
import sendResponse from "../../../../../shared/sendResponse";
import ReportsServices from "./reports.service";

// Get Basic Report
const getClinicBasicReport = catchAsync(async (req: Request, res: Response) => {
    const result = await ReportsServices.getClinicBasicReport(req.user);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.message,
        data: result.data,
    });
});

// Get Cancellation Info
const getCancellationInfo = catchAsync(async (req: Request, res: Response) => {
    const result = await ReportsServices.getCancellationInfo(
        req.query,
        req.user
    );
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.message,
        data: result.data,
    });
});

export default {
    getClinicBasicReport,
    getCancellationInfo,
};
