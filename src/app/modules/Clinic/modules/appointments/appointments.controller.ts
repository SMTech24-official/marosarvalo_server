import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../../../shared/catchAsync";
import sendResponse from "../../../../../shared/sendResponse";
import AppointmentServices from "./appointments.service";
import ApiError from "../../../../../errors/ApiErrors";
import config from "../../../../../config";
import { AppointmentStatus } from "@prisma/client";
import { getValidatedIntId } from "../../../../../utils";
import { FilterBy } from "../../../Admin/admin.service";

// Create Appointment
const createAppointment = catchAsync(async (req: Request, res: Response) => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const documents = files?.documents;

    if (documents.length === 0) {
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            "`documents` are mandatory",
        );
    }

    const clientTimezone = req.headers["x-client-timezone"] || "UTC";

    req.body.documents = documents.map(
        (doc) => `${config.backend_url}/uploads/${doc.filename}`,
    );

    const result = await AppointmentServices.createAppointment(
        req.body,
        clientTimezone as string,
        req.user,
    );

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: result.message,
        data: result.data,
    });
});

// Get Appointments Count
const getAppointmentsCount = catchAsync(async (req: Request, res: Response) => {
    const result = await AppointmentServices.getAppointmentsCount(
        { filterBy: req.query.filterBy as Exclude<FilterBy, "year"> },
        req.user,
    );
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
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
        statusCode: StatusCodes.OK,
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
        statusCode: StatusCodes.OK,
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
                status.toUpperCase() as AppointmentStatus,
            )
        ) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                `Invalid status value. Supported: ${Object.values(
                    AppointmentStatus,
                ).join(", ")}`,
            );
        }

        const result = await AppointmentServices.changeAppointmentStatus(
            id,
            status as AppointmentStatus,
            req.body,
            req.user,
        );
        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: result.message,
            data: result.data,
        });
    },
);

// Get Appointments Overview
const getAppointmentsOverview = catchAsync(
    async (req: Request, res: Response) => {
        const result = await AppointmentServices.getAppointmentsOverview(
            { filterBy: req.query.filterBy as FilterBy },
            req.user,
        );
        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: result.message,
            data: result.data,
        });
    },
);

// Get Appointments Calendar
const getAppointmentsCalender = catchAsync(
    async (req: Request, res: Response) => {
        const result = await AppointmentServices.getAppointmentsCalender(
            req.query,
            req.user,
        );
        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: result.message,
            data: result.data,
            pagination: result.pagination,
        });
    },
);

// Get Appointments
const getAppointments = catchAsync(async (req: Request, res: Response) => {
    const result = await AppointmentServices.getAppointments(
        req.query,
        req.user,
    );
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: result.message,
        data: result.data,
        pagination: result.pagination,
    });
});

// Get Appointment Available time
const getAvailableAppointmentSchedules = catchAsync(
    async (req: Request, res: Response) => {
        const { specialistId, date } = req.query;

        if (!specialistId || !date) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                "Specialist ID and Date are required!",
            );
        }

        const clientTimezone = req.headers["x-client-timezone"] || "UTC";

        const result =
            await AppointmentServices.getAvailableAppointmentSchedules(
                { specialistId: specialistId as string, date: date as string },
                clientTimezone as string,
                req.user,
            );
        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: "Available Appointment Schedules parsed!",
            data: result,
        });
    },
);

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
    getAvailableAppointmentSchedules,
};
