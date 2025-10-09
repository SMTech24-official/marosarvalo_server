import type { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import ClinicServices from "./clinic.service";

//==============================================
//            Doctor Controllers
//=============================================

// Get Doctors Count
const getDoctorsCount = catchAsync(async (req: Request, res: Response) => {
    const result = await ClinicServices.getDoctorsCount(
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

//==============================================
//          Appointment Controllers
//=============================================

// Get Appointments Count
const getAppointmentsCount = catchAsync(async (req: Request, res: Response) => {
    const result = await ClinicServices.getAppointmentsCount(
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
        const result = await ClinicServices.getAppointmentsOverview(
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
        const result = await ClinicServices.getAppointmentsCalender(
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
    const result = await ClinicServices.getAppointments(
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

//==============================================
//           Customer Controllers
//=============================================

// Get New Customers Count
const getNewCustomersCount = catchAsync(async (req: Request, res: Response) => {
    const result = await ClinicServices.getNewCustomersCount(
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

//==============================================
//           Service Controllers
//=============================================

// Get Services Statistics
const getServicesStatistics = catchAsync(
    async (req: Request, res: Response) => {
        const result = await ClinicServices.getServicesStatistics(req.user);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: result.message,
            data: result.data,
        });
    }
);

export default {
    // Doctor Controllers
    getDoctorsCount,

    // Appointment Controllers
    getAppointmentsCount,
    getAppointmentsOverview,
    getAppointments,
    getAppointmentsCalender,

    // Customer Controllers
    getNewCustomersCount,

    // Service Controllers
    getServicesStatistics,
};
