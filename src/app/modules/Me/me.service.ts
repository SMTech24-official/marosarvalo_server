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

      // TODO: Add more fields

      createdAt: true,
      updatedAt: true,
    },
  });

  if (!userProfile) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthenticated Request.");
  }

  return {
    message: "User info fetched",
    data: userProfile,
  };
};

// Update user Info
const updateUserInfo = async (
  user: JwtPayload,
  payload: Record<string, any>
) => {
  const { name, phone, address } = payload;

  const response = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      name,
      phone,
      address,
    },
    select: {
      id: true,
      email: true,
      role: true,

      // TODO: Add more fields

      createdAt: true,
      updatedAt: true,
    },
  });

  return {
    message: "Successfully updated User info",
    data: response,
  };
};

export default {
  getUserInfo,
  updateUserInfo,
};
