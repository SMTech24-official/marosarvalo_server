import prisma from "../../../../../shared/prisma";
import QueryBuilder from "../../../../../utils/queryBuilder";
import { Staff, UserRole } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";
import ApiError from "../../../../../errors/ApiErrors";
import httpStatus from "http-status";
import { CreateStaffInput, UpdateStaffInput } from "./staff.validation";
import { hashPassword } from "../../../../../helpers/passwordHelpers";
import { endOfDay, startOfDay } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { getMaxSequence } from "../../../../../utils";

// Create new Staff
const createNewStaff = async (payload: CreateStaffInput, user: JwtPayload) => {
    const { password, ...rest } = payload;

    const staffData = {
        ...rest,
        clinicId: user.clinicId,
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
                        id:
                            (await getMaxSequence({
                                model: prisma.staff,
                                filter: { clinicId: user.clinicId },
                                next: true,
                            })) ?? 0,
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
                id:
                    (await getMaxSequence({
                        model: prisma.staff,
                        filter: { clinicId: user.clinicId },
                        next: true,
                    })) ?? 0,
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
    const queryBuilder = new QueryBuilder(prisma.staff, query);

    const staffs: (Staff & {
        discipline: {
            id: string;
            name: string;
        };
    })[] = await queryBuilder
        .rawFilter({
            clinicId: user.clinicId,
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
const getStaffById = async (staffId: number, user: JwtPayload) => {
    const staff = await prisma.staff.findUnique({
        where: {
            id_clinicId: {
                id: staffId,
                clinicId: user.clinicId,
            },
            clinicId: user.clinicId,
        },
    });

    if (!staff) {
        throw new ApiError(httpStatus.NOT_FOUND, "Staff not found!");
    }

    return { message: "Staff Data parsed", data: staff };
};

// Update Staff data
const updateStaffData = async (
    staffId: number,
    payload: UpdateStaffInput,
    user: JwtPayload
) => {
    const exists = await prisma.staff.findUnique({
        where: {
            id_clinicId: {
                id: staffId,
                clinicId: user.clinicId,
            },
            clinicId: user.clinicId,
        },
    });

    if (!exists) {
        throw new ApiError(httpStatus.NOT_FOUND, "Staff not found!");
    }

    const response = await prisma.staff.update({
        where: {
            id_clinicId: {
                id: staffId,
                clinicId: user.clinicId,
            },
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
const deleteStaffData = async (staffId: number, user: JwtPayload) => {
    const exists = await prisma.staff.findUnique({
        where: {
            id_clinicId: {
                id: staffId,
                clinicId: user.clinicId,
            },
            clinicId: user.clinicId,
        },
    });

    if (!exists) {
        throw new ApiError(httpStatus.NOT_FOUND, "Staff not found!");
    }

    const response = await prisma.staff.delete({
        where: {
            id_clinicId: {
                id: staffId,
                clinicId: user.clinicId,
            },
        },
    });

    return {
        message: "Staff Data updated",
        data: response,
    };
};

// Update Staff working hours
const updateWorkingHours = async (
    staffId: number,
    payload: any,
    user: JwtPayload
) => {};

// Get Staff Schedule
const getStaffSchedules = async (clientTimezone: string, user: JwtPayload) => {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    const now = new Date();
    const clientNow = toZonedTime(now, clientTimezone);

    const days = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
    ];
    const today = days[clientNow.getDay()];

    const availableStaffs = await prisma.staff.findMany({
        where: {
            clinicId: user.clinicId,
            holiday: {
                date: {
                    not: {
                        gte: todayStart,
                        lte: todayEnd,
                    },
                },
            },
            workingHour: {
                [today]: {
                    not: null,
                },
            },
        },
        include: {
            workingHour: {
                [today]: true,
            },
        },
    });

    const formattedData = availableStaffs.map((staff) => {
        let todaySch: {
            from: { h: string; m: string };
            to: { h: string; m: string };
        } | null = null;
        if (staff.workingHour) {
            todaySch = (staff.workingHour as Record<typeof today, any>)[
                today
            ] as {
                from: { h: string; m: string };
                to: { h: string; m: string };
            };
        }

        const data = {
            id: staff.id,
            name: staff.name,
            role: staff.role,
            timeSlot: todaySch,
        };

        return data;
    });

    return {
        message: "Today Staff Schedules parsed",
        data: formattedData,
    };
};

export default {
    createNewStaff,
    getAllStaff,
    getStaffById,
    updateStaffData,
    deleteStaffData,
    getStaffSchedules,
};
