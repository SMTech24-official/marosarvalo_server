import prisma from "../../../../../shared/prisma";
import QueryBuilder from "../../../../../utils/queryBuilderV2";
import { Prisma, UserRole } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";
import ApiError from "../../../../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";
import {
    CreateStaffInput,
    InsertHolidayInput,
    UpdateStaffInput,
    UpdateWorkingHourInput,
} from "./staff.validation";
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
                StatusCodes.BAD_REQUEST,
                "Password required for Specialist and Receptionist",
            );
        }

        const hashedPass = await hashPassword(password);

        const res = await prisma.user.create({
            data: {
                name: payload.name,
                email: payload.email,
                role: payload.role as UserRole,
                password: hashedPass,
                ...(staffData.role !== "ADMIN"
                    ? {
                          staff: {
                              create: {
                                  ...staffData,
                                  role:
                                      staffData.role === "RECEPTIONIST"
                                          ? "RECEPTIONIST"
                                          : "SPECIALIST",
                                  id:
                                      (await getMaxSequence({
                                          model: prisma.staff,
                                          filter: { clinicId: user.clinicId },
                                          next: true,
                                      })) ?? 0,
                              },
                          },
                      }
                    : {
                          clinic: {
                              create: {
                                  name: staffData.name,
                                  email: staffData.email,
                                  phone: staffData.phone,
                                  address1: staffData.address,
                              },
                          },
                      }),
            },
            select: {
                staff: true,
                clinic: true,
            },
        });

        response = staffData.role !== "ADMIN" ? res.staff : res.clinic;
    } else {
        response = await prisma.staff.create({
            data: {
                ...staffData,
                role: staffData.role !== "ADMIN" ? staffData.role : "OTHERS",
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
const getAllStaff = async (
    query: Record<string, unknown>,
    user: JwtPayload,
) => {
    const queryBuilder = new QueryBuilder<
        typeof prisma.staff,
        Prisma.$StaffPayload
    >(prisma.staff, query);

    const staffs = await queryBuilder
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
        throw new ApiError(StatusCodes.NOT_FOUND, "Staff not found!");
    }

    return { message: "Staff Data parsed", data: staff };
};

// Update Staff data
const updateStaffData = async (
    staffId: number,
    payload: UpdateStaffInput,
    user: JwtPayload,
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
        throw new ApiError(StatusCodes.NOT_FOUND, "Staff not found!");
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
        throw new ApiError(StatusCodes.NOT_FOUND, "Staff not found!");
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
    payload: UpdateWorkingHourInput,
    user: JwtPayload,
) => {
    const staffData = await prisma.staff.findUnique({
        where: {
            id_clinicId: {
                id: staffId,
                clinicId: user.clinicId,
            },
        },
        select: {
            dbId: true,
            id: true,
        },
    });

    if (!staffData) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Staff not found");
    }

    const response = await prisma.staffWorkingHour.upsert({
        where: {
            staffId: staffData.dbId,
        },
        create: {
            ...payload,
            staffId: staffData.dbId,
        },
        update: {
            ...payload,
        },
    });

    return {
        message: "Staff Working Hours updated",
        data: response,
    };
};

// Add staff Holiday
const insertHoliday = async (
    staffId: number,
    payload: InsertHolidayInput,
    user: JwtPayload,
) => {
    const staffData = await prisma.staff.findUnique({
        where: {
            id_clinicId: {
                id: staffId,
                clinicId: user.clinicId,
            },
        },
    });
    if (!staffData) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Staff not found");
    }

    const response = await prisma.staffHoliday.create({
        data: {
            ...payload,
            staffId: staffData.dbId,
        },
    });

    return {
        message: "Staff Holiday inserted",
        data: response,
    };
};

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
            from: string;
            to: string;
        } | null = null;
        if (staff.workingHour) {
            todaySch = (staff.workingHour as Record<typeof today, unknown>)[
                today
            ] as {
                from: string;
                to: string;
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
    updateWorkingHours,
    insertHoliday,
};
