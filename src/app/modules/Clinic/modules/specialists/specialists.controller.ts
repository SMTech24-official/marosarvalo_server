import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import catchAsync from "../../../../../shared/catchAsync";
import sendResponse from "../../../../../shared/sendResponse";
import SpecialistsService from "./specialists.service";
import { FilterBy } from "../../../Admin/admin.service";

// Get Doctors Count
const getSpecialistsCount = catchAsync(async (req: Request, res: Response) => {
    const result = await SpecialistsService.getSpecialistsCount(
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

export default {
    getSpecialistsCount,
};
