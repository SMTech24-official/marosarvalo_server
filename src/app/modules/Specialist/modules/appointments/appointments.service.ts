import prisma from "../../../../../shared/prisma";
import QueryBuilder from "../../../../../utils/queryBuilder";
import { Appointment } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";
import { groupAppointment, parseTimeString } from "./appointments.utils";
import { getDateRange } from "../../specialist.utils";

// Get Appointments Count
const getAppointmentsCount = async (
    query: {
        filterBy: "day" | "week" | "month" | undefined;
    },
    user: JwtPayload
) => {
    const count = await prisma.appointment.count({
        where: {
            specialistId: user.id,
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
// Get Appointments Count
const getSpecialistsCount = async (query: {
    filterBy: "day" | "week" | "month" | undefined;
}) => {
    const count = await prisma.user.count({
        where: {
            role: "SPECIALIST",
            status: "ACTIVE",
            createdAt: getDateRange(query.filterBy),
        },
    });

    return {
        message: "Doctors Count parsed.",
        count: count,
    };
};

// Get Appointment Overview
const getAppointmentsOverview = async (
    query: {
        filterBy: "day" | "week" | "month" | "year" | undefined;
    },
    user: JwtPayload
) => {
    const appointments = await prisma.appointment.findMany({
        where: {
            specialistId: user.id,
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

// Get upcoming Appointments
const getUpcomingAppointments = async (
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
            firstName: string;
            lastName: string;
        };
    })[] = await queryBuilder
        .sort()
        .paginate()
        .rawFilter({
            specialistId: user.id,
            date: {
                gte: startOfToday,
            },
        })
        .include({
            specialist: {
                select: { name: true },
            },
            discipline: {
                select: { name: true },
            },
            service: {
                select: { name: true },
            },
            patient: {
                select: { firstName: true, lastName: true },
            },
        })
        .execute();
    const pagination = await queryBuilder.countTotal();

    const formattedAppointments = appointments.map((appointment) => {
        const startTime = parseTimeString(appointment.timeSlot.split("-")[0]);

        const dateTime = new Date(appointment.date);
        dateTime.setHours(startTime.hours, startTime.minutes);

        const data = {
            id: appointment.id,
            patientName: `${appointment.patient.firstName}${
                appointment.patient.lastName
                    ? " " + appointment.patient.lastName
                    : ""
            }`,
            discipline: appointment.discipline.name,
            service: appointment.service.name,
            specialist: appointment.specialist.name,
            dateTime: dateTime.toJSON(),
        };

        return data;
    });

    return {
        message: "Upcoming Appointments Parsed",
        data: formattedAppointments,
        pagination,
    };
};

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
            patient: { contains: query.searchTerm, mode: "insensitive" },
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

    const formattedAppointments = appointments.map((appointment) => {
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
        data: formattedAppointments,
        pagination,
    };
};

// Set Appointment is Completed
const setAppointmentCompleted = async (
    appointmentId: number,
    user: JwtPayload
) => {
    const response = await prisma.appointment.update({
        where: {
            id_clinicId: {
                id: appointmentId,
                clinicId: user.clinicId,
            },
        },
        data: {
            status: "COMPLETED",
        },
    });

    return {
        message: "Appointment status updated to completed.",
        data: {
            id: response.id,
        },
    };
};

export default {
    getAppointmentsCount,
    getSpecialistsCount,
    getAppointmentsOverview,
    getUpcomingAppointments,
    getAppointmentsCalender,
    setAppointmentCompleted,
};
