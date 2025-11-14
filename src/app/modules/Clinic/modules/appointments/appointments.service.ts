import prisma from "../../../../../shared/prisma";
import QueryBuilder from "../../../../../utils/queryBuilderV2";
import { AppointmentStatus, Prisma } from "@prisma/client";
import { getDateRange } from "../../clinic.utils";
import { JwtPayload } from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { createSlots, groupAppointment } from "./appointments.utils";
import { CreateAppointmentInput } from "./appointments.validation";
import ApiError from "../../../../../errors/ApiErrors";
import { getMaxSequence } from "../../../../../utils";
import { FilterBy } from "../../../Admin/admin.service";

import { endOfDay, getTime, isSameDay, set, startOfDay } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { format } from "date-fns";
import config from "../../../../../config";

// Create new Appointment
// TODO: Check Conflict of Time
const createAppointment = async (
    payload: CreateAppointmentInput & { documents: string[] },
    timezone: string,
    user: JwtPayload,
) => {
    const [specialist, patient] = await Promise.all([
        prisma.staff.findUnique({
            where: {
                id_clinicId: {
                    id: payload.specialistId as number,
                    clinicId: user.clinicId,
                },
            },
            select: {
                id: true,
                dbId: true,
            },
        }),
        prisma.patient.findUnique({
            where: {
                id_clinicId: {
                    id: payload.patientId as number,
                    clinicId: user.clinicId,
                },
            },
            select: {
                id: true,
                dbId: true,
            },
        }),
    ]);
    if (!specialist) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Specialist not found");
    }
    if (!patient) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Patient not found");
    }

    const appointmentExists = await prisma.appointment.findFirst({
        where: {
            OR: [
                {
                    specialistId: specialist.dbId,
                },
                {
                    patientId: specialist.dbId,
                },
            ],
            startTime: { lt: fromZonedTime(payload.endTime, timezone) },
            endTime: { gt: fromZonedTime(payload.startTime, timezone) },
            date: payload.date,
            clinicId: user.clinicId,
        },
        select: {
            id: true,
            specialistId: true,
            patientId: true,
        },
    });

    if (appointmentExists) {
        throw new ApiError(
            StatusCodes.CONFLICT,
            appointmentExists.specialistId === specialist.dbId
                ? "Specialist is not available in this time slot"
                : "Patient already has Appointment in this time slot",
        );
    }

    const holiday = await prisma.staffHoliday.findMany({
        where: {
            staffId: specialist.dbId,
        },
    });

    // Check if the Appointment day is same as specialist's any holiday
    const isHoliday = holiday.some(
        (h) => h.date.toDateString() === new Date(payload.date).toDateString(),
    );

    if (isHoliday) {
        throw new ApiError(
            StatusCodes.CONFLICT,
            "Specialist is on holiday on this date",
        );
    }

    const response = await prisma.appointment.create({
        data: {
            ...payload,
            specialistId: specialist.dbId,
            patientId: patient.dbId,
            clinicId: user.clinicId,
            id:
                (await getMaxSequence({
                    model: prisma.appointment,
                    filter: { clinicId: user.clinicId },
                    next: true,
                })) ?? 0,
        },
    });

    return {
        message: "New Appointment Created!",
        data: {
            id: response.id,
        },
    };
};

// Get Appointments
const getAppointments = async (
    query: Record<string, unknown>,
    user: JwtPayload,
) => {
    const queryBuilder = new QueryBuilder<
        typeof prisma.appointment,
        Prisma.$AppointmentPayload
    >(prisma.appointment, query);

    const startOfToday = startOfDay(new Date());

    const appointments = await queryBuilder
        .search(["patient.firstName", "patient.lastName"])
        .sort()
        .paginate()
        .filter(["status"])
        .rawFilter({
            clinicId: user.clinicId,
            date: {
                gte: startOfToday,
            },
        })
        .include({
            specialist: {
                select: { id: true, name: true },
            },
            discipline: {
                select: { name: true },
            },
            service: {
                select: { name: true },
            },
            patient: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    phone: true,
                },
            },
        })
        .execute();
    const pagination = await queryBuilder.countTotal();

    const formattedData = appointments.map((appointment) => {
        const data = {
            id: appointment.id,
            patient: appointment.patient,
            discipline: appointment.discipline.name,
            service: appointment.service.name,
            specialist: appointment.specialist,
            date: appointment.date,
            status: appointment.status,
            startTime: appointment.startTime,
            endTime: appointment.endTime,
        };

        return data;
    });

    return {
        message: "Upcoming Appointments Parsed",
        data: formattedData,
        pagination,
    };
};

// Get Appointment by Id
const getAppointmentById = async (id: number, user: JwtPayload) => {
    const appointment = await prisma.appointment.findUnique({
        where: {
            id_clinicId: {
                id: id,
                clinicId: user.clinicId,
            },
            patient: {
                clinicId: user.clinicId,
            },
        },
        include: {
            specialist: {
                select: { id: true, name: true, profilePicture: true },
            },
            discipline: {
                select: { name: true },
            },
            service: {
                select: { name: true },
            },
            patient: {
                select: { firstName: true, lastName: true, phone: true },
            },
        },
    });

    if (!appointment) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Appointment not found");
    }

    const data = {
        id: appointment.id,
        patient: {
            name: `${appointment.patient.firstName}${
                appointment.patient.lastName
                    ? " " + appointment.patient.lastName
                    : ""
            }`,
            phone: appointment.patient.phone,
        },
        discipline: appointment.discipline.name,
        service: appointment.service.name,
        specialist: { ...appointment.specialist },
        date: appointment.date,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        status: appointment.status,
        note: appointment.note,
        documents: appointment.documents,
    };

    return {
        message: "Appointment parsed",
        data: data,
    };
};

// Delete Appointment
const deleteAppointment = async (id: number, user: JwtPayload) => {
    const appointment = await prisma.appointment.findUnique({
        where: {
            id_clinicId: {
                id: id,
                clinicId: user.clinicId,
            },
            patient: {
                clinicId: user.clinicId,
            },
        },
    });

    if (!appointment) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Appointment not found");
    }

    await prisma.appointment.delete({
        where: {
            id_clinicId: {
                id: id,
                clinicId: user.clinicId,
            },
        },
    });

    return {
        message: "Appointment Deleted successfully",
        data: {
            id,
        },
    };
};

// Change Appointment Status
const changeAppointmentStatus = async (
    id: number,
    status: AppointmentStatus,
    payload: { reason?: string },
    user: JwtPayload,
) => {
    const appointment = await prisma.appointment.findUnique({
        where: {
            id_clinicId: {
                id: id,
                clinicId: user.clinicId,
            },
            patient: {
                clinicId: user.clinicId,
            },
        },
    });

    if (!appointment) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Appointment not found");
    }

    await prisma.appointment.update({
        where: {
            id_clinicId: {
                id: id,
                clinicId: user.clinicId,
            },
        },
        data: {
            status: status,
            cancelReason: status === "CANCELLED" ? payload.reason : undefined,
        },
    });

    return {
        message: "Appointment Status Updated successfully",
        data: {
            id,
        },
    };
};

// Get Appointments Count
const getAppointmentsCount = async (
    query: {
        filterBy: Exclude<FilterBy, "year">;
    },
    user: JwtPayload,
) => {
    const count = await prisma.appointment.count({
        where: {
            patient: {
                clinicId: user.clinicId,
            },
            status: {
                not: "CANCELLED",
            },
            date: getDateRange(query.filterBy),
        },
    });

    return {
        message: "Appointments Count parsed.",
        count: count,
    };
};

// Get Appointments Overview
const getAppointmentsOverview = async (
    query: {
        filterBy: FilterBy;
    },
    user: JwtPayload,
) => {
    const appointments = await prisma.appointment.findMany({
        where: {
            patient: {
                clinicId: user.clinicId,
            },
            status: {
                not: "CANCELLED",
            },
        },
        select: {
            date: true,
        },
    });

    const appointmentsOverview = groupAppointment(appointments, query.filterBy);

    return {
        message: "Appointments Overview parsed",
        data: appointmentsOverview,
    };
};

// Get Appointments Calendar
const getAppointmentsCalender = async (
    query: Record<string, unknown>,
    user: JwtPayload,
) => {
    const queryBuilder = new QueryBuilder<
        typeof prisma.appointment,
        Prisma.$AppointmentPayload
    >(prisma.appointment, query);

    const appointments = await queryBuilder
        .search(["patient.firstName", "patient.lastName"])
        .filter(["status"])
        .sort()
        .paginate()
        .range()
        .rawFilter({
            clinicId: user.clinicId,
            status: {
                not: "CANCELLED",
            },
        })
        .include({
            specialist: {
                select: { id: true, name: true, profilePicture: true },
            },
            discipline: {
                select: { name: true },
            },
            service: {
                select: { name: true },
            },
            patient: {
                select: { firstName: true, lastName: true, phone: true },
            },
        })
        .execute();
    const pagination = await queryBuilder.countTotal();

    const formattedData = appointments.map((appointment) => {
        const data = {
            id: appointment.id,

            patient: {
                name: `${appointment.patient.firstName}${
                    appointment.patient.lastName
                        ? " " + appointment.patient.lastName
                        : ""
                }`,
                phone: appointment.patient.phone,
            },

            discipline: appointment.discipline.name,
            service: appointment.service.name,
            specialist: { ...appointment.specialist },
            date: appointment.date,
            startTime: appointment.startTime,
            endTime: appointment.endTime,
            status: appointment.status,
            note: appointment.note,
            documents: appointment.documents,
        };

        return data;
    });

    return {
        message: "Appointments parsed",
        data: formattedData,
        pagination,
    };
};

// Get Appointment Available time
const getAvailableAppointmentSchedules = async (
    payload: { specialistId: string; date: string },
    timezone: string,
    user: JwtPayload,
) => {
    const zoned = fromZonedTime(payload.date, timezone);
    const startTime = startOfDay(zoned);
    const endTime = endOfDay(zoned);

    const now = new Date();

    const day = format(toZonedTime(now, timezone), "EEEE").toLowerCase();

    const specialist = await prisma.staff.findUnique({
        where: {
            id_clinicId: {
                id: parseInt(payload.specialistId),
                clinicId: user.clinicId,
            },
            role: "SPECIALIST",
        },
        select: {
            id: true,
            dbId: true,
            workingHour: true,
            holiday: {
                where: {
                    date: {
                        gte: startTime,
                        lte: endTime,
                    },
                },
            },
        },
    });

    if (!specialist) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Specialist not found");
    }

    if (!specialist.workingHour) {
        throw new ApiError(
            StatusCodes.NOT_ACCEPTABLE,
            "Specialist's working hours not found",
        );
    }

    if (
        specialist.holiday &&
        specialist.holiday.some((holiday) => isSameDay(holiday.date, zoned))
    ) {
        throw new ApiError(StatusCodes.NO_CONTENT, "Specialist is in Holiday");
    }

    const specialistWorkTime = (
        specialist.workingHour as Record<string, unknown>
    )[day] as
        | {
              from: string;
              to: string;
          }
        | undefined;

    if (!specialistWorkTime) {
        return [];
    }

    console.log(startTime, endTime);

    // Unavailable appointments for this day
    const appointments = await prisma.appointment.findMany({
        where: {
            status: {
                notIn: ["CANCELLED"],
            },
            date: {
                gte: startTime,
                lte: endTime,
            },
            // startTime: { lte: endTime },
            // endTime: { gte: startTime },
            specialistId: specialist.dbId,
        },
        select: {
            date: true,
            startTime: true,
            endTime: true,
        },
    });

    console.log(appointments);

    const dayAppointmentStart = fromZonedTime(
        new Date(specialistWorkTime["from"]),
        timezone,
    );
    const dayAppointmentEnd = fromZonedTime(
        new Date(specialistWorkTime["to"]),
        timezone,
    );

    const slots = createSlots(
        dayAppointmentStart,
        dayAppointmentEnd,
        Number(config.appointment_length),
        appointments,
    );

    return slots;
};

// Export all in default
export default {
    createAppointment,
    getAppointments,
    getAppointmentById,
    deleteAppointment,
    changeAppointmentStatus,
    getAppointmentsCount,
    getAppointmentsOverview,
    getAppointmentsCalender,
    getAvailableAppointmentSchedules,
};
