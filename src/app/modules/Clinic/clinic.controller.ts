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
//             Communication Controllers
//==============================================

// Create Reminder Schedules
const createReminderSchedules = catchAsync(async (req: Request, res: Response) => {
    const result = await ClinicServices.createReminderSchedules(req.body, req.user);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: result.message,
        data: result.data,
    });
});

// Get History
const getReminderScheduleHistory = catchAsync(async (req: Request, res: Response) => {
    const result = await ClinicServices.getReminderScheduleHistory(req.query, req.user);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.message,
        data: result.data,
        pagination: result.pagination,
    });
});

//==============================================
//              Report Controllers
//==============================================

// Get Basic Report
const getClinicBasicReport = catchAsync(async (req: Request, res: Response) => {
    const result = await ClinicServices.getClinicBasicReport(req.user);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.message,
        data: result.data,
    });
});

// Get Cancellation Info
const getCancellationInfo = catchAsync(async (req: Request, res: Response) => {
    const result = await ClinicServices.getCancellationInfo(req.query, req.user);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.message,
        data: result.data,
    });
});

//==============================================
//             Setting Controllers
//==============================================

// Get Basic Info
const getBasicInfo = catchAsync(async (req: Request, res: Response) => {
    const result = await ClinicServices.getBasicInfo(req.user);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.message,
        data: result.data,
    });
});

// Update Clinic Info
const updateClinicInfo = catchAsync(async (req: Request, res: Response) => {
    const result = await ClinicServices.updateClinicInfo(req.body, req.user);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.message,
        data: result.data,
    });
});

// Get Branding Info
const getBrandingInfo = catchAsync(async (req: Request, res: Response) => {
    const result = await ClinicServices.getBrandingInfo(req.user);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.message,
        data: result.data,
    });
});

// Update Branding Info
const updateBrandingInfo = catchAsync(async (req: Request, res: Response) => {
    const result = await ClinicServices.updateBrandingInfo(req.body, req.user);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.message,
        data: result.data,
    });
});

//==============================================
//             Service Controllers
//==============================================

// Get Services List
const getServices = catchAsync(async (req: Request, res: Response) => {
    const result = await ClinicServices.getServices(req.query, req.user);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.message,
        data: result.data,
        pagination: result.pagination,
    });
});

// Create Service
const createService = catchAsync(async (req: Request, res: Response) => {
    const result = await ClinicServices.createService(req.body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: result.message,
        data: result.data,
    });
});

// Update Service
const updateService = catchAsync(async (req: Request, res: Response) => {
    const result = await ClinicServices.updateService(req.params.id, req.body, req.user);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.message,
        data: result.data,
    });
});

// Delete Service
const deleteService = catchAsync(async (req: Request, res: Response) => {
    const result = await ClinicServices.deleteService(req.params.id, req.user);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.message,
        data: result.data,
    });
});

//==============================================
//             Discipline Controllers
//==============================================

// Get Disciplines
const getDisciplines = catchAsync(async (req: Request, res: Response) => {
    const result = await ClinicServices.getDisciplines(req.query, req.user);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.message,
        data: result.data,
        pagination: result.pagination,
    });
});

// Create Discipline
const createDiscipline = catchAsync(async (req: Request, res: Response) => {
    const result = await ClinicServices.createDiscipline(req.body, req.user);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: result.message,
        data: result.data,
    });
});

// Update Discipline
const updateDiscipline = catchAsync(async (req: Request, res: Response) => {
    const result = await ClinicServices.updateDiscipline(req.params.id, req.body, req.user);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.message,
        data: result.data,
    });
});

// Delete Discipline
const deleteDiscipline = catchAsync(async (req: Request, res: Response) => {
    const result = await ClinicServices.deleteDiscipline(req.params.id, req.user);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.message,
        data: result.data,
    });
});

//==============================================
//              Staff Controllers
//==============================================

// Create New Staff
const createNewStaff = catchAsync(async (req: Request, res: Response) => {
    const result = await ClinicServices.createNewStaff(req.body, req.user);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: result.message,
        data: result.data,
    });
});

// Get All Staff
const getAllStaff = catchAsync(async (req: Request, res: Response) => {
    const result = await ClinicServices.getAllStaff(req.query, req.user);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.message,
        data: result.data,
        pagination: result.pagination,
    });
});

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

    // Communication Controllers
    createReminderSchedules,
    getReminderScheduleHistory,

    // Report Controllers
    getClinicBasicReport,
    getCancellationInfo,

    // Setting Controllers
    getBasicInfo,
    updateClinicInfo,
    getBrandingInfo,
    updateBrandingInfo,

    // Service Controllers
    getServices,
    createService,
    updateService,
    deleteService,
    getServicesStatistics,

    // Discipline Controllers
    getDisciplines,
    createDiscipline,
    updateDiscipline,
    deleteDiscipline,

    // Staff Controllers
    createNewStaff,
    getAllStaff,
};
