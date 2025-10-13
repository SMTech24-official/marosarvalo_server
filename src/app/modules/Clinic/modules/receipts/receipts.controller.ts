import type { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../../../shared/catchAsync";
import sendResponse from "../../../../../shared/sendResponse";
import ReceiptServices from "./receipts.service";

// Create Receipt
const createReceipt = catchAsync(async (req: Request, res: Response) => {
    const result = await ReceiptServices.createReceipt(req.body, req.user);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: result.message,
        data: result.data,
    });
});

// Get Receipts
const getReceipts = catchAsync(async (req: Request, res: Response) => {
    const result = await ReceiptServices.getReceipts(req.query, req.user);
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
        const result = await ReceiptServices.getReceiptDetailsById(
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
    const result = await ReceiptServices.deleteReceipt(req.params.id);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.message,
        data: result.data,
    });
});


// Export all functions
export default {
    createReceipt,
    getReceipts,
    getReceiptDetailsById,
    deleteReceipt,
};