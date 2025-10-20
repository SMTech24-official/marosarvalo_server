import type { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../../../shared/catchAsync";
import sendResponse from "../../../../../shared/sendResponse";
import AppointmentServices from "./appointments.service";
import ApiError from "../../../../../errors/ApiErrors";
import config from "../../../../../config";
import { AppointmentStatus } from "@prisma/client";
import { getValidatedIntId } from "../../../../../utils";

// Create Appointment
const createAppointment = catchAsync(async (req: Request, res: Response) => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const documents = files?.documents;

    if (documents.length === 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, "`documents` are mandatory");
    }

    req.body.documents = documents.map(
        (doc) => `${config.backend_url}/uploads/${doc.filename}`
    );

    const result = await AppointmentServices.createAppointment(req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: result.message,
        data: result.data,
    });
});

// Get Appointments Count
const getAppointmentsCount = catchAsync(async (req: Request, res: Response) => {
    const result = await AppointmentServices.getAppointmentsCount(
        req.query as any,
        req.user
    );
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.message,
        data: result.count,
    });
});

// Get Appointment by Id
const getAppointmentById = catchAsync(async (req: Request, res: Response) => {
    const id = getValidatedIntId(req.params.id);

    const result = await AppointmentServices.getAppointmentById(id, req.user);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.message,
        data: result.data,
    });
});

// Delete Appointment
const deleteAppointment = catchAsync(async (req: Request, res: Response) => {
    const id = getValidatedIntId(req.params.id);
    
    const result = await AppointmentServices.deleteAppointment(id, req.user);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.message,
        data: result.data,
    });
});

// Change Appointment Status
const changeAppointmentStatus = catchAsync(
    async (req: Request, res: Response) => {
        const id = getValidatedIntId(req.params.id);
        const { status } = req.params;
        if (
            !Object.values(AppointmentStatus).includes(
                status.toUpperCase() as any
            )
        ) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                `Invalid status value. Supported: ${Object.values(
                    AppointmentStatus
                ).join(", ")}`
            );
        }

        const result = await AppointmentServices.changeAppointmentStatus(
            id,
            status as AppointmentStatus,
            req.body,
            req.user
        );
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: result.message,
            data: result.data,
        });
    }
);

// Get Appointments Overview
const getAppointmentsOverview = catchAsync(
    async (req: Request, res: Response) => {
        const result = await AppointmentServices.getAppointmentsOverview(
            req.query as any,
            req.user
        );
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: result.message,
            data: result.data,
        });
    }
);

// Get Appointments Calendar
const getAppointmentsCalender = catchAsync(
    async (req: Request, res: Response) => {
        const result = await AppointmentServices.getAppointmentsCalender(
            req.query as any,
            req.user
        );
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: result.message,
            data: result.data,
            pagination: result.pagination,
        });
    }
);

// Get Appointments
const getAppointments = catchAsync(async (req: Request, res: Response) => {
    const result = await AppointmentServices.getAppointments(
        req.query as any,
        req.user
    );
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.message,
        data: result.data,
        pagination: result.pagination,
    });
});

// Export all functions
export default {
    createAppointment,
    getAppointments,
    getAppointmentById,
    deleteAppointment,
    changeAppointmentStatus,
    getAppointmentsCount,
    getAppointmentsOverview,
    getAppointmentsCalender,
};
