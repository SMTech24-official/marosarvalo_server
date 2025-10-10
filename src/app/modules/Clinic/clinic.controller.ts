import type { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import ClinicServices from "./clinic.service";
import ApiError from "../../../errors/ApiErrors";
import config from "../../../config";

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

    const result = await ClinicServices.createAppointment(req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: result.message,
        data: result.data,
    });
});

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
//           Patient Controllers
//=============================================

// Get new Patients Count
const getNewPatientsCount = catchAsync(async (req: Request, res: Response) => {
    const result = await ClinicServices.getNewPatientsCount(
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

// Create new Patient
const createPatient = catchAsync(async (req: Request, res: Response) => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const guardianDocuments = files?.guardianDocuments;
    const documents = files?.documents;
    const otherDocuments = files?.otherDocuments;

    if (documents.length === 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, "`documents` are mandatory");
    }

    req.body.guardianDocuments = guardianDocuments.map(
        (doc) => `${config.backend_url}/uploads/${doc.filename}`
    );
    req.body.documents = documents.map(
        (doc) => `${config.backend_url}/uploads/${doc.filename}`
    );
    req.body.otherDocuments = otherDocuments.map(
        (doc) => `${config.backend_url}/uploads/${doc.filename}`
    );

    const result = await ClinicServices.createPatient(req.body, req.user);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: result.message,
        data: result.data,
    });
});

// Get Patients
const getPatients = catchAsync(async (req: Request, res: Response) => {
    const result = await ClinicServices.getPatients(req.query, req.user);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.message,
        data: result.data,
        pagination: result.pagination,
    });
});

// Get Patient by Id
const getPatientById = catchAsync(async (req: Request, res: Response) => {
    const result = await ClinicServices.getPatientById(req.params.id);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.message,
        data: result.data,
    });
});

// Get Patient Appointments
const getPatientAppointments = catchAsync(
    async (req: Request, res: Response) => {
        const result = await ClinicServices.getPatientAppointments(
            req.params.id,
            req.query
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

// Get Patient Bonds
const getPatientBonds = catchAsync(async (req: Request, res: Response) => {
    const result = await ClinicServices.getPatientBonds(
        req.params.id,
        req.query
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

//==============================================
//              Receipt Controllers
//==============================================

// Create Receipt
const createReceipt = catchAsync(async (req: Request, res: Response) => {
    const result = await ClinicServices.createReceipt(req.body, req.user);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: result.message,
        data: result.data,
    });
});

// Get Receipts
const getReceipts = catchAsync(async (req: Request, res: Response) => {
    const result = await ClinicServices.getReceipts(req.query, req.user);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.message,
        data: result.data,
        pagination: result.pagination,
    });
});

// Get Receipt Details by Id
const getReceiptDetailsById = catchAsync(
    async (req: Request, res: Response) => {
        const result = await ClinicServices.getReceiptDetailsById(
            req.params.id
        );
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: result.message,
            data: result.data,
        });
    }
);

// Delete Receipt
const deleteReceipt = catchAsync(async (req: Request, res: Response) => {
    const result = await ClinicServices.deleteReceipt(req.params.id);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.message,
        data: result.data,
    });
});

export default {
    // Doctor Controllers
    getDoctorsCount,

    // Appointment Controllers
    createAppointment,
    getAppointmentsCount,
    getAppointmentsOverview,
    getAppointments,
    getAppointmentsCalender,

    // Patient Controllers
    getNewPatientsCount,
    createPatient,
    getPatients,
    getPatientById,
    getPatientAppointments,
    getPatientBonds,

    // Receipt Controllers
    createReceipt,
    getReceipts,
    getReceiptDetailsById,
    deleteReceipt,

    // Service Controllers
    getServicesStatistics,
};
