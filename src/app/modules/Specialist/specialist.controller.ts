import type { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import SpecialistServices from "./specialist.service";

// Get Appointments Count
const getAppointmentsCount = catchAsync(async (req: Request, res: Response) => {
    const result = await SpecialistServices.getAppointmentsCount(
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

// Get New Customers Count
const getNewCustomersCount = catchAsync(async (req: Request, res: Response) => {
    const result = await SpecialistServices.getNewCustomersCount(
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

// Get Appointments Overview
const getAppointmentsOverview = catchAsync(
    async (req: Request, res: Response) => {
        const result = await SpecialistServices.getAppointmentsOverview(
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

// Get Upcoming Appointments
const getUpcomingAppointments = catchAsync(
    async (req: Request, res: Response) => {
        const result = await SpecialistServices.getUpcomingAppointments(
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

// Get Appointments Calendar
const getAppointmentsCalender = catchAsync(
    async (req: Request, res: Response) => {
        const result = await SpecialistServices.getAppointmentsCalender(
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

export default {
    getAppointmentsCount,
    getDoctorsCount,
    getNewCustomersCount,
    getAppointmentsOverview,
    getUpcomingAppointments,
    getAppointmentsCalender,
};
