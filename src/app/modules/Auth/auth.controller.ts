import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import AuthServices from "./auth.service";
import config from "../../../config";

// Login user
const loginUser = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthServices.loginUser(req.body);

    res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: config.env !== "development",
        sameSite: "lax",
    });

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: result.message,
        data: {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
        },
    });
});

// Logout User
const logoutUser = catchAsync(async (req: Request, res: Response) => {
    // Clear the token cookie
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "User Successfully logged out",
    });
});

// Change Password
const changePassword = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;

    const result = await AuthServices.changePassword(user, req.body);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: result.message,
    });
});

// Forgot Password
const forgotPassword = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthServices.forgotPassword(req.body);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: result.message,
    });
});

// Refresh Token
const refreshToken = catchAsync(async (req, res) => {
    const result = await AuthServices.refreshToken(req.body);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: result.message,
        data: { accessToken: result.accessToken },
    });
});

export default {
    loginUser,
    logoutUser,
    changePassword,
    forgotPassword,
    refreshToken,
};
