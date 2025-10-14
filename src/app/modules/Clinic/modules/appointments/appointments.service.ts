import prisma from "../../../../../shared/prisma";
import QueryBuilder from "../../../../../utils/queryBuilder";
import { Appointment } from "@prisma/client";
import {
    getDateRange,
    getUserClinicId,
    parseTimeString,
} from "../../clinic.utils";
import { JwtPayload } from "jsonwebtoken";
import { groupAppointment } from "./appointments.utils";
import { CreateAppointmentInput } from "./appointments.validation";

// Get Appointments Count
const getAppointmentsCount = async (
    query: {
        filterBy: "day" | "week" | "month" | undefined;
    },
    user: JwtPayload
) => {
    const clinicId = await getUserClinicId(user);

    const count = await prisma.appointment.count({
        where: {
            patient: {
                clinicId: clinicId,
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
    const clinicId = await getUserClinicId(user);

    const appointments = await prisma.appointment.findMany({
        where: {
            patient: {
                clinicId: clinicId,
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
    const clinicId = await getUserClinicId(user);

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
                clinicId: clinicId,
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

// Create new Appointment - // TODO: Check availability of Specialist
const createAppointment = async (
    payload: CreateAppointmentInput & { documents: string[] }
) => {
    const response = await prisma.appointment.create({
        data: {
            ...payload,
        },
    });

    return {
        message: "New Appointment Created!",
        data: response,
    };
};

// Export all in default
export default {
    getAppointmentsCount,
    getAppointmentsOverview,
    getAppointmentsCalender,
    getAppointments,
    createAppointment,
};
