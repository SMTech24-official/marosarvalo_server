import type { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../../../shared/catchAsync";
import sendResponse from "../../../../../shared/sendResponse";
import DisciplineServices from "./disciplines.service";

// Get Disciplines
const getDisciplines = catchAsync(async (req: Request, res: Response) => {
    const result = await DisciplineServices.getDisciplines(req.query, req.user);
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
    const result = await DisciplineServices.createDiscipline(
        req.body,
        req.user,
    );
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: result.message,
        data: result.data,
    });
});

// Update Discipline
const updateDiscipline = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;

    const result = await DisciplineServices.updateDiscipline(
        id,
        req.body,
        req.user,
    );
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.message,
        data: result.data,
    });
});

// Delete Discipline
const deleteDiscipline = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;

    const result = await DisciplineServices.deleteDiscipline(id, req.user);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.message,
        data: result.data,
    });
});

// Get Disciplines for Appointment
const getAppointmentDisciplines = catchAsync(
    async (req: Request, res: Response) => {
        const result = await DisciplineServices.getAppointmentDisciplines(
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

// Export all functions
export default {
    getDisciplines,
    createDiscipline,
    updateDiscipline,
    deleteDiscipline,
    getAppointmentDisciplines,
};
