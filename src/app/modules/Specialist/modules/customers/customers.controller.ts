import type { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../../../shared/catchAsync";
import sendResponse from "../../../../../shared/sendResponse";
import CustomersServices from "./customers.service";

// Get New Customers Count
const getNewCustomersCount = catchAsync(async (req: Request, res: Response) => {
    const result = await CustomersServices.getNewCustomersCount(
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

export default { getNewCustomersCount };
