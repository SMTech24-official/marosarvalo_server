import bcrypt from "bcrypt";

import { StatusCodes } from "http-status-codes";

import config from "../../../config";
import ApiError from "../../../errors/ApiErrors";
import { jwtHelpers } from "../../../helpers/jwtHelpers";
import prisma from "../../../shared/prisma";
import emailSender from "../../../helpers/emailSender/emailSender";
import { comparePassword } from "../../../helpers/passwordHelpers";
import { JwtPayload, Secret } from "jsonwebtoken";
import { GenerateForgetPasswordTemplate } from "./auth.template";
import {
    ChangePasswordSchemaInput,
    ForgotPasswordSchemaInput,
    LoginSchemaInput,
    RefreshTokenSchemaInput,
} from "./auth.validation";

// Login User
const loginUser = async (payload: LoginSchemaInput) => {
    const userData = await prisma.user.findUnique({
        where: {
            email: payload.email,
        },
    });
    if (!userData) {
        throw new ApiError(
            StatusCodes.UNAUTHORIZED,
            "Invalid Credentials",
        );
    }

    if (!payload.password || !userData?.password) {
        throw new ApiError(
            StatusCodes.UNAUTHORIZED,
            "Invalid Credentials",
        );
    }

    const isCorrectPassword = await comparePassword(
        payload.password,
        userData.password,
    );

    if (!isCorrectPassword) {
        throw new ApiError(
            StatusCodes.UNAUTHORIZED,
            "Invalid Credentials",
        );
    }

    if (userData.status === "INACTIVE")
        throw new ApiError(
            StatusCodes.UNAUTHORIZED,
            "Your account has been Blocked. Contact Admin to Activate your Account.",
        );

    const jwtPayload = {
        id: userData.id,
    };

    const accessToken = jwtHelpers.generateToken(
        jwtPayload,
        config.jwt.jwt_secret as Secret,
        config.jwt.expires_in as string,
    );

    const refreshToken = jwtHelpers.generateToken(
        jwtPayload,
        config.jwt.refresh_token_secret as Secret,
        config.jwt.refresh_token_expires_in as string,
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
    payload: ChangePasswordSchemaInput,
) => {
    const userInfo = await prisma.user.findUnique({
        where: { id: user?.id },
    });

    if (!userInfo || !userInfo?.password) {
        throw new ApiError(
            StatusCodes.UNAUTHORIZED,
            "Unauthenticated Request!",
        );
    }

    const isPasswordValid = await bcrypt.compare(
        payload.oldPassword,
        userInfo?.password,
    );

    if (!isPasswordValid) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "Password is Incorrect");
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
const forgotPassword = async (payload: ForgotPasswordSchemaInput) => {
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
        config.jwt.reset_pass_token_expires_in as string,
    );

    const resetPassLink =
        config.reset_pass_link +
        `?userId=${userData.id}&token=${resetPassToken}`;

    await emailSender(
        "Reset Your Password",
        userData.email,
        GenerateForgetPasswordTemplate(resetPassLink),
    );
    return {
        message: "Reset password Instructions sent to your Email.",
        resetPassLink,
    };
};

// Refresh Token
const refreshToken = async (payload: RefreshTokenSchemaInput) => {
    let decrypted;

    try {
        decrypted = jwtHelpers.verifyToken(
            payload.refreshToken,
            config.jwt.refresh_token_secret as string,
        );
    } catch (err) {
        console.log(err);
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            "Refresh Token is Invalid or Expired",
        );
    }

    // checking if the user is exist
    const userData = await prisma.user.findUnique({
        where: { id: decrypted.id },
    });

    if (!userData) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthenticated Request");
    }

    const jwtPayload = {
        id: userData.id,
    };

    const accessToken = jwtHelpers.generateToken(
        jwtPayload,
        config.jwt.jwt_secret as Secret,
        config.jwt.expires_in as string,
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
