import type { Request, Response } from "express";

import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import AdminServices from "./admin.service";

// Create new Admin
const createNewAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminServices.createNewAdmin(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: result.message,
    data: result.data,
  });
});

export default { createNewAdmin };
