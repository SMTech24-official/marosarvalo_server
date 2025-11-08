import { NextFunction, Request, Response } from "express";

import { Secret } from "jsonwebtoken";
import config from "../../config";

import httpStatus from "http-status";
import ApiError from "../../errors/ApiErrors";
import { jwtHelpers } from "../../helpers/jwtHelpers";
import prisma from "../../shared/prisma";
import { UserRole } from "@prisma/client";

const auth = (...roles: UserRole[]) => {
    return async (
        req: Request & { user?: unknown },
        res: Response,
        next: NextFunction,
    ) => {
        try {
            const token = req.headers.authorization;

            if (!token) {
                throw new ApiError(
                    httpStatus.UNAUTHORIZED,
                    "Unauthorized Request",
                );
            }

            const verifiedUser = jwtHelpers.verifyToken(
                token,
                config.jwt.jwt_secret as Secret,
            );

            const user = await prisma.user.findUnique({
                where: {
                    id: verifiedUser.id,
                },
                select: {
                    id: true,
                    clinicId: true,
                    email: true,
                    status: true,
                    clinic: {
                        select: { status: true },
                    },
                    role: true,
                },
            });

            if (!user) {
                throw new ApiError(
                    httpStatus.UNAUTHORIZED,
                    "Unauthorized Request",
                );
            }
            if (user.status !== "ACTIVE") {
                throw new ApiError(
                    httpStatus.UNAUTHORIZED,
                    "Your Account Status is Inactive. Contact Admin.",
                );
            }

            if (
                user.role !== "SUPER_ADMIN" &&
                user.clinic?.status !== "ACTIVE"
            ) {
                throw new ApiError(
                    httpStatus.FORBIDDEN,
                    "Your Associated Clinic's Status is Inactive.",
                );
            }

            if (roles.length && !roles.includes(user.role)) {
                throw new ApiError(httpStatus.FORBIDDEN, "Forbidden Request!");
            }

            req.user = {
                id: user.id,
                role: user.role,
                email: user.email,
                clinicId: user.clinicId,
            };

            next();
        } catch (err) {
            next(err);
        }
    };
};

export default auth;
