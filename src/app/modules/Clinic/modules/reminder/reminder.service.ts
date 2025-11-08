import prisma from "../../../../../shared/prisma";
import QueryBuilder from "../../../../../utils/queryBuilder";
import {
    ActivityStatus,
    CommunicationMethod,
    ReminderScheduleType,
    ScheduledReminderHistory,
} from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";

import {
    CreateReminderScheduleInput,
    UpdateReminderScheduleInput,
} from "./reminder.validation";
import httpStatus from "http-status";
import ApiError from "../../../../../errors/ApiErrors";

// Create Reminder Schedules - Only for Clinic Admin
const createReminderSchedules = async (
    payload: CreateReminderScheduleInput,
    user: JwtPayload,
) => {
    const response = await prisma.reminderSchedule.create({
        data: { ...payload, clinicId: user.clinicId },
    });

    return {
        message: "Reminder Schedule created",
        data: response,
    };
};

// Get Reminder Schedules
const getReminderSchedules = async (user: JwtPayload) => {
    const reminders = await prisma.reminderSchedule.findMany({
        where: {
            clinicId: user.clinicId,
        },
    });

    return {
        message: "Reminder Schedules Data parsed",
        data: reminders,
    };
};

// Update Reminder Schedule
const updateSchedule = async (
    scheduleId: string,
    payload: UpdateReminderScheduleInput,
    user: JwtPayload,
) => {
    const exists = await prisma.reminderSchedule.findUnique({
        where: {
            id: scheduleId,
        },
        select: {
            clinicId: true,
        },
    });

    if (!exists) {
        throw new ApiError(httpStatus.NOT_FOUND, "Reminder not found!");
    }

    if (exists.clinicId !== user.clinicId) {
        throw new ApiError(httpStatus.FORBIDDEN, "Unauthorized request");
    }

    const response = await prisma.reminderSchedule.update({
        where: {
            id: scheduleId,
            clinicId: user.clinicId,
        },
        data: {
            ...payload,
        },
    });

    return {
        message: "Reminder Schedule updated",
        data: response,
    };
};

// Delete Reminder Schedule
const deleteSchedule = async (scheduleId: string, user: JwtPayload) => {
    const exists = await prisma.reminderSchedule.findUnique({
        where: {
            id: scheduleId,
        },
        select: {
            clinicId: true,
        },
    });

    if (!exists) {
        throw new ApiError(httpStatus.NOT_FOUND, "Reminder not found!");
    }

    if (exists.clinicId !== user.clinicId) {
        throw new ApiError(httpStatus.FORBIDDEN, "Unauthorized request");
    }

    const response = await prisma.reminderSchedule.delete({
        where: {
            id: scheduleId,
            clinicId: user.clinicId,
        },
    });

    return {
        message: "Reminder Schedule deleted",
        data: response,
    };
};

// Update Reminder activity status
const updateReminderStatus = async (
    scheduleId: string,
    status: ActivityStatus,
    user: JwtPayload,
) => {
    const exists = await prisma.reminderSchedule.findUnique({
        where: {
            id: scheduleId,
        },
        select: {
            clinicId: true,
            status: true,
        },
    });

    if (!exists) {
        throw new ApiError(httpStatus.NOT_FOUND, "Reminder not found!");
    }

    if (exists.clinicId !== user.clinicId) {
        throw new ApiError(httpStatus.FORBIDDEN, "Unauthorized request");
    }

    if (exists.status === status) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Schedule is already " + status,
        );
    }

    const response = await prisma.reminderSchedule.update({
        where: {
            id: scheduleId,
            clinicId: user.clinicId,
        },
        data: {
            status: status,
        },
    });

    return {
        message: "Reminder Schedule status updated",
        data: response,
    };
};

// Get History
const getReminderScheduleHistory = async (
    query: Record<string, unknown>,
    user: JwtPayload,
) => {
    const queryBuilder = new QueryBuilder(
        prisma.scheduledReminderHistory,
        query,
    );

    const histories: (ScheduledReminderHistory & {
        patient: {
            firstName: true;
            lastName: true;
            email: true;
        };
        schedule: {
            type: ReminderScheduleType;
            subject: string;
            communicationMethods: CommunicationMethod;
        };
    })[] = await queryBuilder
        .sort()
        .paginate()
        .rawFilter({
            patient: {
                clinicId: user.clinicId,
                ...(query.searchTerm
                    ? {
                          OR: [
                              {
                                  firstName: {
                                      contains: query.searchTerm,
                                      mode: "insensitive",
                                  },
                              },
                              {
                                  lastName: {
                                      contains: query.searchTerm,
                                      mode: "insensitive",
                                  },
                              },
                          ],
                      }
                    : {}),
            },
        })
        .include({
            patient: {
                select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            },
            schedule: {
                select: {
                    type: true,
                    subject: true,
                    communicationMethods: true,
                },
            },
        })
        .execute();

    const pagination = await queryBuilder.countTotal();

    const formattedData = histories.map((history) => {
        const data = {
            patient: history.patient,
            type: history.schedule.type,
            communicationMethods: history.schedule.communicationMethods,
            subject: history.schedule.subject,
            status: history.status,
            sentAt: history.createdAt,
        };

        return data;
    });

    return {
        message: "Reminder sent History parsed",
        data: formattedData,
        pagination,
    };
};

export default {
    createReminderSchedules,
    getReminderSchedules,
    updateSchedule,
    deleteSchedule,
    updateReminderStatus,
    getReminderScheduleHistory,
};
