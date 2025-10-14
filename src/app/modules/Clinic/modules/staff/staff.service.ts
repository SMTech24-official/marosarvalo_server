import prisma from "../../../../../shared/prisma";
import QueryBuilder from "../../../../../utils/queryBuilder";
import { Staff, UserRole } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";
import { getUserClinicId } from "../.././clinic.utils";
import ApiError from "../../../../../errors/ApiErrors";
import httpStatus from "http-status";
import { CreateStaffInput, UpdateStaffInput } from "./staff.validation";
import { hashPassword } from "../../../../../helpers/passwordHelpers";

// Get Staff Schedule
const getStaffSchedules = async (
    query: Record<string, any>,
    user: JwtPayload
) => {};

// Create new Staff
const createNewStaff = async (payload: CreateStaffInput, user: JwtPayload) => {
    const clinicId = await getUserClinicId(user);

    const { password, ...rest } = payload;

    const staffData = {
        ...rest,
        clinicId: clinicId,
    };
    let response;

    if (
        payload.role.toUpperCase() === UserRole.SPECIALIST ||
        payload.role.toUpperCase() === UserRole.RECEPTIONIST
    ) {
        if (!password) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                "Password required for Specialist and Receptionist"
            );
        }

        const hashedPass = await hashPassword(password);

        const res = await prisma.user.create({
            data: {
                name: payload.name,
                email: payload.email,
                role: payload.role as UserRole,
                password: hashedPass,
                staff: {
                    create: {
                        ...staffData,
                    },
                },
            },
            select: {
                staff: true,
            },
        });

        response = res.staff;
    } else {
        response = await prisma.staff.create({
            data: {
                ...staffData,
            },
        });
    }

    return {
        message: "New Staff created",
        data: response,
    };
};

// Get All Staff
const getAllStaff = async (query: Record<string, any>, user: JwtPayload) => {
    const clinicId = await getUserClinicId(user);

    const queryBuilder = new QueryBuilder(prisma.staff, query);

    const staffs: (Staff & {
        discipline: {
            id: string;
            name: string;
        };
    })[] = await queryBuilder
        .rawFilter({
            clinicId: clinicId,
        })
        .search(["name"])
        .sort()
        .paginate()
        .include({
            discipline: {
                select: {
                    id: true,
                    name: true,
                },
            },
        })
        .execute();
    const pagination = await queryBuilder.countTotal();

    const formattedData = staffs.map((staff) => {
        const data = {
            id: staff.id,
            name: staff.name,
            email: staff.email,
            role: staff.role,
            status: staff.status,
            discipline: staff.discipline,
        };

        return data;
    });

    return {
        message: "Staff Data parsed",
        data: formattedData,
        pagination,
    };
};

// Get Staff by Id
const getStaffById = async (staffId: string, user: JwtPayload) => {
    const clinicId = await getUserClinicId(user);

    const staff = await prisma.staff.findUnique({
        where: {
            id: staffId,
            clinicId: clinicId,
        },
    });

    if (!staff) {
        throw new ApiError(httpStatus.NOT_FOUND, "Staff not found!");
    }

    return { message: "Staff Data parsed", data: staff };
};

// Update Staff data
const updateStaffData = async (
    staffId: string,
    payload: UpdateStaffInput,
    user: JwtPayload
) => {
    const clinicId = await getUserClinicId(user);

    const exists = await prisma.staff.findUnique({
        where: {
            id: staffId,
            clinicId,
        },
    });

    if (!exists) {
        throw new ApiError(httpStatus.NOT_FOUND, "Staff not found!");
    }

    const response = await prisma.staff.update({
        where: {
            id: exists.id,
        },
        data: {
            ...payload,
        },
    });

    return {
        message: "Staff Data updated",
        data: response,
    };
};

// Delete Staff data
const deleteStaffData = async (staffId: string, user: JwtPayload) => {
    const clinicId = await getUserClinicId(user);

    const exists = await prisma.staff.findUnique({
        where: {
            id: staffId,
            clinicId,
        },
    });

    if (!exists) {
        throw new ApiError(httpStatus.NOT_FOUND, "Staff not found!");
    }

    const response = await prisma.staff.delete({
        where: {
            id: exists.id,
        },
    });

    return {
        message: "Staff Data updated",
        data: response,
    };
};

export default {
    createNewStaff,
    getAllStaff,
    getStaffById,
    updateStaffData,
    deleteStaffData,
};
