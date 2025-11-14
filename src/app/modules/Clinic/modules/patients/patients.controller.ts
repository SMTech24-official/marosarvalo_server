import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../../../shared/catchAsync";
import sendResponse from "../../../../../shared/sendResponse";
import PatientServices from "./patients.service";
import ApiError from "../../../../../errors/ApiErrors";
import config from "../../../../../config";
import { getValidatedIntId } from "../../../../../utils";
import { FilterBy } from "../../../Admin/admin.service";

// Get new Patients Count
const getNewPatientsCount = catchAsync(async (req: Request, res: Response) => {
    const result = await PatientServices.getNewPatientsCount(
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

// Create new Patient
const createPatient = catchAsync(async (req: Request, res: Response) => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const guardianDocuments = files?.guardianDocuments;
    const documents = files?.documents;
    const otherDocuments = files?.otherDocuments;

    if (documents.length === 0) {
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            "`documents` are mandatory",
        );
    }

    req.body.guardianDocuments = guardianDocuments?.map(
        (doc) => `${config.uploads_url}/${doc.filename}`,
    );
    req.body.documents = documents?.map(
        (doc) => `${config.uploads_url}/${doc.filename}`,
    );
    req.body.otherDocuments = otherDocuments?.map(
        (doc) => `${config.uploads_url}/${doc.filename}`,
    );

    const result = await PatientServices.createPatient(req.body, req.user);

    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: result.message,
        data: result.data,
    });
});

// Get Patients
const getPatients = catchAsync(async (req: Request, res: Response) => {
    const result = await PatientServices.getPatients(req.query, req.user);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: result.message,
        data: result.data,
        pagination: result.pagination,
    });
});

// Get Patient by Id
const getPatientById = catchAsync(async (req: Request, res: Response) => {
    const id = getValidatedIntId(req.params.id);

    const result = await PatientServices.getPatientById(id, req.user);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: result.message,
        data: result.data,
    });
});

// Get Patient Appointments
const getPatientAppointments = catchAsync(
    async (req: Request, res: Response) => {
        const id = getValidatedIntId(req.params.id);

        const result = await PatientServices.getPatientAppointments(
            id,
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

// Get Patient Bonds
const getPatientBonds = catchAsync(async (req: Request, res: Response) => {
    const id = getValidatedIntId(req.params.id);

    const result = await PatientServices.getPatientBonds(
        id,
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

// Search Patient
const searchPatient = catchAsync(async (req: Request, res: Response) => {
    const result = await PatientServices.searchPatient(req.query, req.user);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: result.message,
        data: result.data,
    });
});

// Export all functions
export default {
    getNewPatientsCount,
    createPatient,
    getPatients,
    getPatientById,
    getPatientAppointments,
    getPatientBonds,
    searchPatient,
};
