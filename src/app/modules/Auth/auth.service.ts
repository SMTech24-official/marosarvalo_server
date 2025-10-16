import bcrypt from "bcrypt";

import httpStatus from "http-status";

import config from "../../../config";
import ApiError from "../../../errors/ApiErrors";
import { jwtHelpers } from "../../../helpers/jwtHelpers";
import prisma from "../../../shared/prisma";
import emailSender from "../../../helpers/emailSender/emailSender";
import { comparePassword } from "../../../helpers/passwordHelpers";
import { JwtPayload, Secret } from "jsonwebtoken";
import { GenerateForgetPasswordTemplate } from "./auth.template";

// Login User
const loginUser = async (payload: { email: string; password: string }) => {
    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            email: payload.email,
        },
    });
    if (!userData) {
        throw new ApiError(
            httpStatus.UNAUTHORIZED,
            "Invalid Credentials Provided"
        );
    }

    if (!payload.password || !userData?.password) {
        throw new ApiError(
            httpStatus.UNAUTHORIZED,
            "Invalid Credentials Provided"
        );
    }

    const isCorrectPassword = await comparePassword(
        payload.password,
        userData.password
    );

    if (!isCorrectPassword) {
        throw new ApiError(
            httpStatus.UNAUTHORIZED,
            "Invalid Credentials Provided"
        );
    }

    if (userData.status === "INACTIVE")
        throw new ApiError(
            httpStatus.UNAUTHORIZED,
            "Your account has been Blocked. Contact Admin to Activate your Account."
        );

    const jwtPayload = {
        id: userData.id,
    };

    const accessToken = jwtHelpers.generateToken(
        jwtPayload,
        config.jwt.jwt_secret as Secret,
        config.jwt.expires_in as string
    );

    const refreshToken = jwtHelpers.generateToken(
        jwtPayload,
        config.jwt.refresh_token_secret as Secret,
        config.jwt.refresh_token_expires_in as string
    );

    return {
        refreshToken,
        accessToken,
        message: "Login Successful!",
    };
};

// Change Password
const changePassword = async (
    user: JwtPayload,
    payload: {
        oldPassword: string;
        newPassword: string;
    }
) => {
    if (!payload.oldPassword || !payload.newPassword) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Body Provided");
    }

    const userInfo = await prisma.user.findUnique({
        where: { id: user?.id },
    });

    if (!userInfo || !userInfo?.password) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthenticated Request!");
    }

    const isPasswordValid = await bcrypt.compare(
        payload.oldPassword,
        userInfo?.password
    );

    if (!isPasswordValid) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Password is Incorrect");
    }

    const hashedPassword = await bcrypt.hash(payload.newPassword, 12);

    await prisma.user.update({
        where: {
            id: user.id,
        },
        data: {
            password: hashedPassword,
        },
    });
    return { message: "Password changed successfully" };
};

// Forgot Password
const forgotPassword = async (payload: { email: string }) => {
    const userData = await prisma.user.findUnique({
        where: {
            email: payload.email,
        },
    });
    if (!userData) {
        throw new ApiError(404, "User not found");
    }

    const resetPassToken = jwtHelpers.generateToken(
        { email: userData.email, role: userData.role },
        config.jwt.reset_pass_secret as Secret,
        config.jwt.reset_pass_token_expires_in as string
    );

    const resetPassLink =
        config.reset_pass_link +
        `?userId=${userData.id}&token=${resetPassToken}`;

    await emailSender(
        "Reset Your Password",
        userData.email,
        GenerateForgetPasswordTemplate(resetPassLink)
    );
    return {
        message: "Reset password Instructions sent to your Email.",
        resetPassLink,
    };
};

// Refresh Token
const refreshToken = async (payload: { refreshToken: string }) => {
    if (!payload.refreshToken) {
        throw new ApiError(httpStatus.BAD_REQUEST, "refreshToken is required");
    }

    let decrypted;

    try {
        decrypted = jwtHelpers.verifyToken(
            payload.refreshToken,
            config.jwt.jwt_secret as string
        );
    } catch (error) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Refresh Token is Invalid or Expired"
        );
    }

    // checking if the user is exist
    const userData = await prisma.user.findUnique({
        where: { id: decrypted.id },
    });

    if (!userData) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthenticated Request");
    }

    const jwtPayload = {
        id: userData.id,
    };

    const accessToken = jwtHelpers.generateToken(
        jwtPayload,
        config.jwt.jwt_secret as Secret,
        config.jwt.expires_in as string
    );

    return {
        accessToken,
        message: "Access Token Generated",
    };
};

export default {
    loginUser,
    changePassword,
    forgotPassword,
    refreshToken,
};
