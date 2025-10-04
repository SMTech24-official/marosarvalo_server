import prisma from "../../../shared/prisma";

import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import { JwtPayload } from "jsonwebtoken";

// Get current User Info
const getUserInfo = async (user: JwtPayload) => {
    const userProfile = await prisma.user.findUnique({
        where: {
            id: user?.id,
        },
        select: {
            id: true,
            email: true,
            role: true,
            address: true,
            phone: true,
            introduction: true,

            staff: {
                select: {
                    profession: true,
                },
            },

            createdAt: true,
            updatedAt: true,
        },
    });

    if (!userProfile) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthenticated Request.");
    }

    // User profile with profession but without staff
    const { staff, ...rest } = userProfile;
    const userProfileWithProfession = {
        ...rest,
        ...(staff ? { profession: staff.profession } : {}),
    };

    return {
        message: "User info fetched",
        data: userProfileWithProfession,
    };
};

// Update user Info
const updateUserInfo = async (
    payload: Record<string, any>,
    user: JwtPayload
) => {
    const { name, phone, address, introduction, employeeId, profession } =
        payload;

    const select = {
        id: true,
        email: true,
        role: true,
        address: true,
        phone: true,
        introduction: true,

        createdAt: true,
        updatedAt: true,
    };

    let response;

    if (user.role === "RECEPTIONIST") {
        response = await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                name,
                phone,
                address,
                introduction,
                staff: {
                    update: {
                        name,
                        phone,
                        address,
                        employeeId,
                        profession,
                    },
                },
            },
            select,
        });
    } else {
        response = await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                name,
                phone,
                address,
                introduction,
            },
            select,
        });
    }

    return {
        message: "Successfully updated User info",
        data: response,
    };
};

export default {
    getUserInfo,
    updateUserInfo,
};
