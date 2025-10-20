import type { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import SpecialistServices from "./specialist.service";

// Get Doctors Count
const getDoctorsCount = catchAsync(async (req: Request, res: Response) => {
    const result = await SpecialistServices.getDoctorsCount(req.query as any);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.message,
        data: result.count,
    });
});

export default {
    getDoctorsCount,
};
