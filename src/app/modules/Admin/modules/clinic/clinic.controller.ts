import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../../../shared/catchAsync";
import sendResponse from "../../../../../shared/sendResponse";
import ClinicServices from "./clinic.service";

// Create new Clinic - with Clinic Admin
const createNewClinic = catchAsync(async (req: Request, res: Response) => {
    const result = await ClinicServices.createNewClinic(req.body);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: result.message,
        data: result.data,
    });
});
// Get All Clinic
const getAllClinic = catchAsync(async (req: Request, res: Response) => {
    const result = await ClinicServices.getAllClinic(req.query);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: result.message,
        data: result.data,
        pagination: result.pagination,
    });
});

// Get Single Clinic
const getSingleClinic = catchAsync(async (req: Request, res: Response) => {
    const result = await ClinicServices.getSingleClinic(req.params.id);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: result.message,
        data: result.data,
    });
});

// Update Clinic
const updateClinic = catchAsync(async (req: Request, res: Response) => {
    const result = await ClinicServices.updateClinic(req.params.id, req.body);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: result.message,
    });
});

// Delete Clinic
const deleteClinic = catchAsync(async (req: Request, res: Response) => {
    const result = await ClinicServices.deleteClinic(req.params.id);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: result.message,
    });
});

export default {
    createNewClinic,
    getAllClinic,
    getSingleClinic,
    updateClinic,
    deleteClinic,
};
