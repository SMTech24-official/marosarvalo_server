import prisma from "../../../../../shared/prisma";
import QueryBuilder from "../../../../../utils/queryBuilderV2";
import { Prisma, UserRole } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";
import ApiError from "../../../../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";
import {
    CreateStaffInput,
    InsertHolidayInput,
    UpdateHolidayInput,
    UpdateStaffInput,
    UpdateWorkingHourInput,
} from "./staff.validation";
import { hashPassword } from "../../../../../helpers/passwordHelpers";
import { endOfDay, startOfDay } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { getMaxSequence } from "../../../../../utils";

// Create new Staff
// TODO: Check this - create clinic? why?
const createNewStaff = async (payload: CreateStaffInput, user: JwtPayload) => {
    const { password, ...rest } = payload;

    const exists = await prisma.user.findUnique({
        where: {
            email: payload.email,
        },
    });
    if (exists) {
        throw new ApiError(
            StatusCodes.CONFLICT,
            "Staff with email Already Exists",
        );
    }

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
        data: { id: response?.id },
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

    const response = await prisma.$transaction(async (tx) => {
        await tx.user.delete({
            where: {
                id: exists.userId!,
            },
        });

        return await tx.staff.delete({
            where: {
                id_clinicId: {
                    id: staffId,
                    clinicId: user.clinicId,
                },
            },
        });
    });

    return {
        message: "Staff Data updated",
        data: {
            id: response.id,
        },
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
            saturday: null,
            sunday: null,
            monday: null,
            tuesday: null,
            wednesday: null,
            thursday: null,
            friday: null,
            ...payload,
            staffId: staffData.dbId,
        },
        update: {
            saturday: null,
            sunday: null,
            monday: null,
            tuesday: null,
            wednesday: null,
            thursday: null,
            friday: null,
            ...payload,
        },
    });

    return {
        message: "Staff Working Hours updated",
        data: response,
    };
};

// Get Staff working hours
const getWorkingHours = async (staffId: number, user: JwtPayload) => {
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

    const response = await prisma.staffWorkingHour.findUnique({
        where: {
            staffId: staffData.dbId,
        },
    });

    return {
        message: "Staff Working Hours retrieved",
        data: response,
    };
};

// Add staff Holiday
const insertHoliday = async (
    staffId: number,
    payload: InsertHolidayInput,
    user: JwtPayload,
) => {
    const startDay = startOfDay(new Date(payload.date));
    const endDay = endOfDay(new Date(payload.date));

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
            holiday: {
                where: {
                    date: {
                        gte: startDay,
                        lte: endDay,
                    },
                },
            },
        },
    });
    if (!staffData) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Staff not found");
    }

    if (staffData.holiday.length > 0) {
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            "Holiday in this date already exists",
        );
    }

    if (new Date(payload.date) < new Date()) {
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            "Cannot insert holiday for past date",
        );
    }

    const response = await prisma.staffHoliday.create({
        data: {
            ...payload,
            staffId: staffData.dbId,
        },
    });

    return {
        message: "Staff Holiday inserted",
        data: { id: response.id },
    };
};

// Get All Holiday Data
const getAllHolidays = async (
    staffId: number,
    query: Record<string, unknown>,
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

    const queryBuilder = new QueryBuilder<
        typeof prisma.staffHoliday,
        Prisma.$StaffHolidayPayload
    >(prisma.staffHoliday, query);

    const holidays = await queryBuilder
        .rawFilter({
            staffId: staffData.dbId,
        })
        .sort()
        .paginate()
        .execute();

    const pagination = await queryBuilder.countTotal();

    return {
        message: "Staff Holidays retrieved",
        data: holidays,
        pagination,
    };
};

// Update Holiday
const updateHoliday = async (
    holidayId: string,
    payload: UpdateHolidayInput,
    user: JwtPayload,
) => {
    const holiday = await prisma.staffHoliday.findUnique({
        where: {
            id: holidayId,
            staff: {
                clinicId: user.clinicId,
            },
        },
    });

    if (!holiday) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Holiday not found");
    }

    if (payload.date && new Date(payload.date) < new Date()) {
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            "Cannot update holiday date to past",
        );
    }

    const response = await prisma.staffHoliday.update({
        where: {
            id: holidayId,
        },
        data: {
            ...payload,
        },
    });

    return {
        message: "Staff Holiday updated",
        data: response,
    };
};

// Delete Holiday
const deleteHoliday = async (holidayId: string, user: JwtPayload) => {
    const holiday = await prisma.staffHoliday.findUnique({
        where: {
            id: holidayId,
            staff: {
                clinicId: user.clinicId,
            },
        },
    });

    if (!holiday) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Holiday not found");
    }

    const response = await prisma.staffHoliday.delete({
        where: {
            id: holidayId,
        },
    });

    return {
        message: "Staff Holiday deleted",
        data: {
            id: response.id,
        },
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
            workingHour: {
                [today]: {
                    not: null,
                },
            },
        },
        include: {
            workingHour: {
                select: {
                    [today]: true,
                },
            },
            holiday: {
                where: {
                    date: {
                        not: {
                            gte: todayStart,
                            lte: todayEnd,
                        },
                    },
                },
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
    getWorkingHours,
    insertHoliday,
    getAllHolidays,
    updateHoliday,
    deleteHoliday,
};
