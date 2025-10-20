import prisma from "../../../../../shared/prisma";
import QueryBuilder from "../../../../../utils/queryBuilder";
import { Appointment, AppointmentStatus } from "@prisma/client";
import { getDateRange, parseTimeString } from "../../clinic.utils";
import { JwtPayload } from "jsonwebtoken";
import httpStatus from "http-status";
import { groupAppointment } from "./appointments.utils";
import { CreateAppointmentInput } from "./appointments.validation";
import ApiError from "../../../../../errors/ApiErrors";
import { getMaxSequence } from "../../../../../utils";

// Create new Appointment - // TODO: Check availability of Specialist
const createAppointment = async (
    payload: CreateAppointmentInput & { documents: string[] },
    user: JwtPayload
) => {
    const response = await prisma.appointment.create({
        data: {
            ...payload,
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
        data: response,
    };
};

// Get Appointments
const getAppointments = async (
    query: Record<string, any>,
    user: JwtPayload
) => {
    const queryBuilder = new QueryBuilder(prisma.appointment, query);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const appointments: (Appointment & {
        specialist: {
            name: string;
        };
        discipline: {
            name: string;
        };
        service: {
            name: string;
        };
        patient: {
            id: string;
            firstName: string;
            lastName: string;
            phone: string;
        };
    })[] = await queryBuilder
        .sort()
        .paginate()
        .filter(["status"])
        .rawFilter({
            patient: query.searchTerm
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
                : undefined,
            specialistId: user.id,
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
        const startTime = parseTimeString(appointment.timeSlot.split("-")[0]);

        const dateTime = new Date(appointment.date);
        dateTime.setHours(startTime.hours, startTime.minutes);

        const data = {
            id: appointment.id,
            patient: appointment.patient,
            discipline: appointment.discipline.name,
            service: appointment.service.name,
            specialist: appointment.specialist,
            dateTime: dateTime.toJSON(),
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
        throw new ApiError(httpStatus.NOT_FOUND, "Appointment not found");
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
        timeSlot: appointment.timeSlot,
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
        throw new ApiError(httpStatus.NOT_FOUND, "Appointment not found");
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
    user: JwtPayload
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
        throw new ApiError(httpStatus.NOT_FOUND, "Appointment not found");
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
        filterBy: "day" | "week" | "month" | undefined;
    },
    user: JwtPayload
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
        filterBy: "day" | "week" | "month" | "year" | undefined;
    },
    user: JwtPayload
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
    query: Record<string, any>,
    user: JwtPayload
) => {
    const queryBuilder = new QueryBuilder(prisma.appointment, query);

    const appointments: (Appointment & {
        specialist: {
            id: string;
            name: string;
            profilePicture: string;
        };

        discipline: {
            name: string;
        };

        service: {
            name: string;
        };

        patient: {
            firstName: string;
            lastName: string;
            phone: string;
        };
    })[] = await queryBuilder
        .filter(["status"])
        .sort()
        .paginate()
        .range()
        .rawFilter({
            patient: {
                contains: query.searchTerm,
                mode: "insensitive",
                clinicId: user.clinicId,
            },
            specialistId: user.id,
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
            timeSlot: appointment.timeSlot,
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
};
