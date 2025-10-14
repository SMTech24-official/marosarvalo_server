import prisma from "../../../../../shared/prisma";
import QueryBuilder from "../../../../../utils/queryBuilder";
import {
    CommunicationMethod,
    ReminderScheduleType,
    ScheduledReminderHistory,
} from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";
import { getUserClinicId } from "../../clinic.utils";
import { CreateReminderScheduleInput } from "./communication.validation";

// Create Reminder Schedules - Only for Clinic Admin
const createReminderSchedules = async (
    payload: CreateReminderScheduleInput,
    user: JwtPayload
) => {
    const clinicId = await getUserClinicId(user);

    const response = await prisma.reminderSchedule.create({
        data: { ...payload, clinicId: clinicId },
    });

    return {
        message: "Reminder Schedule created",
        data: response,
    };
};

// Get History
const getReminderScheduleHistory = async (
    query: Record<string, any>,
    user: JwtPayload
) => {
    const clinicId = await getUserClinicId(user);

    const queryBuilder = new QueryBuilder(
        prisma.scheduledReminderHistory,
        query
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
                clinicId: clinicId,
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
    getReminderScheduleHistory,
};
