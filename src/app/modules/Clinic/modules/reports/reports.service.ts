import prisma from "../../../../../shared/prisma";
import QueryBuilder from "../../../../../utils/queryBuilder";
import { Appointment } from "@prisma/client";
import {
    countServices,
    getAttendanceStats,
    getWeeklyStats,
} from "./reports.utils";

import { JwtPayload } from "jsonwebtoken";

// Get basic Report - w/o any change in request - This month
const getClinicBasicReport = async (user: JwtPayload) => {
    const now = new Date();

    // Start of current month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Start of next month
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [receipts, appointments, patients, appointmentsOfServices] =
        await Promise.all([
            prisma.invoice.findMany({
                where: {
                    clinicId: user.clinicId,
                    createdAt: {
                        gte: startOfMonth,
                        lt: startOfNextMonth,
                    },
                },
                select: {
                    paid: true,
                    createdAt: true,
                },
            }),
            prisma.appointment.findMany({
                where: {
                    patient: {
                        clinicId: user.clinicId,
                    },
                    date: {
                        gte: startOfMonth,
                        lt: startOfNextMonth,
                    },
                },
                select: {
                    status: true,
                },
            }),
            prisma.patient.findMany({
                where: {
                    clinicId: user.clinicId,
                },
                select: {
                    id: true,
                },
            }),
            prisma.appointment.findMany({
                where: {
                    patient: {
                        clinicId: user.clinicId,
                    },
                    createdAt: {
                        gte: startOfMonth,
                        lt: startOfNextMonth,
                    },
                },
                select: {
                    service: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            }),
        ]);

    const formattedData = {
        revenue: {
            total: receipts.reduce((p, c) => p + c.paid, 0),
            statistics: getWeeklyStats(receipts),
        },
        attendance: getAttendanceStats(appointments),
        totalPatients: patients.length,
        popularServices: countServices(appointmentsOfServices),
        cancellation: {
            total: appointments.filter((item) => item.status === "CANCELLED")
                .length,
            rate:
                appointments.length === 0
                    ? 0
                    : (appointments.filter(
                          (item) => item.status === "CANCELLED"
                      ).length /
                          appointments.length) *
                      100,
        },
    };

    return {
        message: "Basic Report parsed",
        data: formattedData,
    };
};

// Get cancellation Info
const getCancellationInfo = async (
    query: Record<string, any>,
    user: JwtPayload
) => {
    const queryBuilder = new QueryBuilder(prisma.appointment, query);

    const appointments: (Appointment & {
        patient: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
        };
        service: {
            id: string;
            name: string;
        };
        specialist: {
            id: string;
            name: string;
        };
    })[] = await queryBuilder
        .rawFilter({
            patient: {
                clinicId: user.clinicId,
            },
            status: "CANCELLED",
        })
        .sort()
        .paginate()
        .include({
            patient: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            },
            service: {
                select: {
                    id: true,
                    name: true,
                },
            },
            specialist: {
                select: {
                    id: true,
                    name: true,
                },
            },
        })
        .execute();
    const pagination = await queryBuilder.countTotal();

    const formattedData = appointments.map((appointment) => {
        const data = {
            id: appointment.id,
            date: appointment.date,
            timeSlot: appointment.timeSlot,
            service: appointment.service,
            specialist: appointment.specialist,
            patient: appointment.patient,
            status: appointment.status,
            reason: appointment.cancelReason,
        };

        return data;
    });

    return {
        message: "Cancellation data parsed",
        data: formattedData,
        pagination,
    };
};

export default {
    getClinicBasicReport,
    getCancellationInfo,
};
