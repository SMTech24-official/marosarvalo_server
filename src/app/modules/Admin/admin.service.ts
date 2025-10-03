import { Request } from "express";
import prisma from "../../../shared/prisma";
import QueryBuilder from "../../../utils/queryBuilder";
import config from "../../../config";
import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import { type CreateAdminInput } from "./admin.validation";

// Create new Admin
const createNewAdmin = async (body: CreateAdminInput) => {
  const hashedPassword = await bcrypt.hash(body.password, 12);

  const existing = await prisma.user.findUnique({
    where: { email: body.email },
  });

  if (existing) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already Exists");
  }

  const response = await prisma.user.create({
    data: {
      ...body,
      password: hashedPassword,
      role: "SUPER_ADMIN",
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
    message: "Admin Created Successfully",
    data: response,
  };
};

export default { createNewAdmin };
