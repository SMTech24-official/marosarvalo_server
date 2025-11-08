import type { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../../../shared/catchAsync";
import sendResponse from "../../../../../shared/sendResponse";
import AppointmentsServices from "./appointments.service";
import { getValidatedIntId } from "../../../../../utils";
import { FilterBy } from "../../specialist.utils";

// Get Appointments Count
const getAppointmentsCount = catchAsync(async (req: Request, res: Response) => {
    const result = await AppointmentsServices.getAppointmentsCount(
        { filterBy: req.query.filterBy as Exclude<FilterBy, "year"> },
        req.user,
    );
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.message,
        data: result.count,
    });
});

// Get Specialists Count
const getSpecialistsCount = catchAsync(async (req: Request, res: Response) => {
    const result = await AppointmentsServices.getSpecialistsCount({
        filterBy: req.query.filterBy as Exclude<FilterBy, "year">,
    });

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.message,
        data: result.count,
    });
});

// Get Appointments Overview
const getAppointmentsOverview = catchAsync(
    async (req: Request, res: Response) => {
        const result = await AppointmentsServices.getAppointmentsOverview(
            { filterBy: req.query.filterBy as FilterBy },
            req.user,
        );
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: result.message,
            data: result.data,
        });
    },
);

// Get Upcoming Appointments
const getUpcomingAppointments = catchAsync(
    async (req: Request, res: Response) => {
        const result = await AppointmentsServices.getUpcomingAppointments(
            req.query as Record<string, unknown>,
            req.user,
        );
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: result.message,
            data: result.data,
            pagination: result.pagination,
        });
    },
);

// Get Appointments Calendar
const getAppointmentsCalender = catchAsync(
    async (req: Request, res: Response) => {
        const result = await AppointmentsServices.getAppointmentsCalender(
            req.query as Record<string, unknown>,
            req.user,
        );
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: result.message,
            data: result.data,
            pagination: result.pagination,
        });
    },
);

// Set Appointment Completed
const setAppointmentCompleted = catchAsync(
    async (req: Request, res: Response) => {
        const id = getValidatedIntId(req.params.id);

        const result = await AppointmentsServices.setAppointmentCompleted(
            id,
            req.user,
        );
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: result.message,
            data: result.data,
        });
    },
);

export default {
    getAppointmentsCount,
    getSpecialistsCount,
    getAppointmentsOverview,
    getUpcomingAppointments,
    getAppointmentsCalender,
    setAppointmentCompleted,
};
