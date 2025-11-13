import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../../../shared/catchAsync";
import sendResponse from "../../../../../shared/sendResponse";
import BookingsServices from "./bookings.service";

const getAllBookings = catchAsync(async (req: Request, res: Response) => {
    const result = await BookingsServices.getAllBookings(req.query);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Bookings fetched successfully",
        pagination: result.pagination,
        data: result.result,
    });
});

const getSingleBookings = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await BookingsServices.getSingleBookings(id);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Single Booking fetched successfully",
        data: result,
    });
});

const deleteBookings = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await BookingsServices.deleteBookings(id);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Booking deleted successfully",
    });
});

const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const result = await BookingsServices.updateBookingStatus(id, status);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Booking status updated successfully",
        data: result,
    });
});

export default {
    getAllBookings,
    getSingleBookings,
    deleteBookings,
    updateBookingStatus,
};
