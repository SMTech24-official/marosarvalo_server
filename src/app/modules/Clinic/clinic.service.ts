import prisma from "../../../shared/prisma";
import QueryBuilder from "../../../utils/queryBuilder";
import { Appointment } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";
import {
    getDateRange,
    groupAppointment,
    parseTimeString,
} from "./clinic.utils";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import { CreateAppointmentInput } from "./clinic.validation";

// TODO: Make it Uni-useable for Clinic AND Receptionist

//==============================================
//              Doctor Services
//==============================================

// Get Doctors Count
const getDoctorsCount = async (
    query: {
        filterBy: "day" | "week" | "month" | undefined;
    },
    user: JwtPayload
) => {
    const clinicAdmin = await prisma.user.findUnique({
        where: {
            id: user.id,
            role: "CLINIC_ADMIN",
        },
    });

    if (!clinicAdmin) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Request");
    }

    const count = await prisma.user.count({
        where: {
            clinicId: clinicAdmin?.clinicId!,
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

//==============================================
//            Appointment Services
//==============================================

// Get Appointments Count
const getAppointmentsCount = async (
    query: {
        filterBy: "day" | "week" | "month" | undefined;
    },
    user: JwtPayload
) => {
    const clinicAdmin = await prisma.user.findUnique({
        where: {
            id: user.id,
            role: "CLINIC_ADMIN",
        },
    });

    if (!clinicAdmin) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Request");
    }

    const count = await prisma.appointment.count({
        where: {
            patient: {
                clinicId: clinicAdmin?.clinicId!,
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
    const clinicAdmin = await prisma.user.findUnique({
        where: {
            id: user.id,
            role: "CLINIC_ADMIN",
        },
    });

    if (!clinicAdmin) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Request");
    }

    const appointments = await prisma.appointment.findMany({
        where: {
            patient: {
                clinicId: clinicAdmin?.clinicId!,
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
    const clinicAdmin = await prisma.user.findUnique({
        where: {
            id: user.id,
            role: "CLINIC_ADMIN",
        },
    });

    if (!clinicAdmin) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Request");
    }

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
                clinicId: clinicAdmin.clinicId,
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
            firstName: string;
            lastName: string;
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

// Create new Appointment - // TODO: Check availability of Specialist
const createNewAppointment = async (
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

//==============================================
//             Customer Services
//==============================================

// Get New Customers Count
const getNewCustomersCount = async (
    query: {
        filterBy: "day" | "week" | "month" | undefined;
    },
    user: JwtPayload
) => {
    const clinicAdmin = await prisma.user.findUnique({
        where: {
            id: user.id,
            role: "CLINIC_ADMIN",
        },
    });

    if (!clinicAdmin) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Request");
    }

    const count = await prisma.patient.count({
        where: {
            clinicId: clinicAdmin?.clinicId!,
            createdAt: getDateRange(query.filterBy),
        },
    });

    return {
        message: "Doctors Count parsed.",
        count: count,
    };
};

//==============================================
//              Staff Services
//==============================================

// Get Staff Schedule
const getStaffSchedules = async (
    query: Record<string, any>,
    user: JwtPayload
) => {};

//==============================================
//             Service Services
//==============================================

// Get Services Statistics
const getServicesStatistics = async (user: JwtPayload) => {
    const clinicAdmin = await prisma.user.findUnique({
        where: {
            id: user.id,
            role: "CLINIC_ADMIN",
        },
    });

    if (!clinicAdmin) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Request");
    }

    const disciplines = await prisma.discipline.findMany({
        where: {
            clinicId: clinicAdmin.clinicId!,
        },
        include: {
            services: {
                include: {
                    appointments: {
                        where: {
                            status: {
                                not: "CANCELLED",
                            },
                        },
                    },
                },
            },
        },
    });

    const formattedData: { label: string; value: number }[] = [];

    disciplines.forEach((discipline) => {
        discipline.services.forEach((service) => {
            formattedData.push({
                label: service.name,
                value: service.appointments.length,
            });
        });
    });

    return {
        message: "Services Overview parsed",
        data: formattedData,
    };
};

export default {
    // Doctor Services
    getDoctorsCount,

    // Appointment Services
    getAppointmentsCount,
    getAppointmentsOverview,
    getAppointmentsCalender,
    getAppointments,
    createNewAppointment,

    // Customer Services
    getNewCustomersCount,

    // Staff Services
    getStaffSchedules,

    // Service Services
    getServicesStatistics,
};
