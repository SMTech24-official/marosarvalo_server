import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../../../shared/catchAsync";
import sendResponse from "../../../../../shared/sendResponse";
import CustomersServices from "./customers.service";
import { FilterBy } from "../../specialist.utils";

// Get New Customers Count
const getNewCustomersCount = catchAsync(async (req: Request, res: Response) => {
    const result = await CustomersServices.getNewCustomersCount(
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

export default { getNewCustomersCount };
