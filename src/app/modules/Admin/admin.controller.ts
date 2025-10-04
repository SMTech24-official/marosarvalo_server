import type { Request, Response } from "express";

import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import AdminServices from "./admin.service";

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

// Create new Clinic - with Clinic Admin
const createNewClinic = catchAsync(async (req: Request, res: Response) => {
    const result = await AdminServices.createNewClinic(req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: result.message,
        data: result.data,
    });
});

// Get All Clinic
const getAllClinic = catchAsync(async (req: Request, res: Response) => {
    const result = await AdminServices.getAllClinic(req.query);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.message,
        data: result.data,
        pagination: result.pagination,
    });
});

export default { createNewAdmin, createNewClinic, getAllClinic };
