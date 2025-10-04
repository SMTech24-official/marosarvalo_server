import type { Request, Response } from "express";

import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import UserServices from "./me.service";

// Get current User Info
const getUserInfo = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const result = await UserServices.getUserInfo(user);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.message,
        data: result.data,
    });
});

// Update User Info
const updateUserInfo = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const result = await UserServices.updateUserInfo(req.body, user);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.message,
        data: result.data,
    });
});

export default {
    getUserInfo,
    updateUserInfo,
};
