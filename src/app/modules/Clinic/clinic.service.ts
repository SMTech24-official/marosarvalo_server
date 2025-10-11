import prisma from "../../../shared/prisma";
import QueryBuilder from "../../../utils/queryBuilder";
import {
    Appointment,
    Bond,
    CommunicationMethod,
    Patient,
    Product,
    ProductType,
    Receipt,
    ReminderScheduleType,
    ScheduledReminderHistory,
    UserRole,
} from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";
import {
    applyTaxAndDiscount,
    countServices,
    getAttendanceStats,
    getDateRange,
    getNewestDate,
    getWeeklyStats,
    groupAppointment,
    parseTimeString,
} from "./clinic.utils";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import {
    CreateAppointmentInput,
    CreatePatientInput,
    CreateReceiptInput,
    CreateReminderScheduleInput,
} from "./clinic.validation";

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

//==============================================
//             Patient Services
//==============================================

// Get New Patients Count
const getNewPatientsCount = async (
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

// Create new Patient
const createPatient = async (
    payload: CreatePatientInput & {
        guardianDocuments: string[];
        documents: string[];
        otherDocuments: string[];
    },
    user: JwtPayload
) => {
    const userData = await prisma.user.findUnique({
        where: {
            id: user.id,
        },
    });

    const response = await prisma.patient.create({
        data: {
            ...payload,
            clinicId: userData?.clinicId!,
        },
    });

    return {
        message: "New Patient created",
        data: response,
    };
};

// Get Patients
const getPatients = async (query: Record<string, any>, user: JwtPayload) => {
    const userData = await prisma.user.findUnique({
        where: {
            id: user.id,
        },
    });

    const queryBuilder = new QueryBuilder(prisma.patient, query);

    const patients: (Patient & {
        appointments: {
            date: Date;
            timeSlot: string;
        }[];
    })[] = await queryBuilder
        .search(["firstName", "lastName", "phone", "email"])
        .sort()
        .range()
        .paginate()
        .filter(["status"])
        .rawFilter({
            clinicId: userData?.clinicId,
        })
        .include({
            appointments: {
                select: {
                    date: true,
                    timeSlot: true,
                },
            },
        })
        .execute();
    const pagination = await queryBuilder.countTotal();

    const formattedData = patients.map((patient) => {
        const lastAppointment = getNewestDate(patient.appointments);

        const data = {
            id: patient.id,
            name: `${patient.firstName}${
                patient.lastName ? " " + patient.lastName : ""
            }`,
            phone: patient.phone,
            email: patient.email,
            status: patient.status,
            documentId: patient.documentId,
            lastAppointment,
        };

        return data;
    });

    return {
        message: "Patient Data parsed",
        data: formattedData,
        pagination,
    };
};

// Get Patient by Id - // TODO: Check which Id. _id or documentId
const getPatientById = async (patientId: string) => {
    const patient = await prisma.patient.findUnique({
        where: {
            id: patientId,
        },
        include: {
            appointments: {
                select: {
                    date: true,
                    timeSlot: true,
                },
            },
        },
    });

    if (!patient) {
        throw new ApiError(httpStatus.NOT_FOUND, "Patient not Found");
    }

    const formattedData = {
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        phone: patient.phone,
        email: patient.email,
        dateOfBirth: patient.dateOfBirth,
        contactPreferences: patient.contactPreferences,
        address: patient.address,
        gender: patient.gender,
        lastAppointment: getNewestDate(patient.appointments),
        guardian: patient.guardianName
            ? {
                  name: patient.guardianName,
                  relation: patient.guardianRelation,
                  documents: patient.guardianDocuments,
              }
            : null,
        note: patient.note,
        attachments: {
            documents: patient.documents,
            otherDocuments: patient.otherDocuments,
        },
        medicalHistory: {
            medicalCondition: patient.medicalCondition,
            allergies: patient.allergies,
            medications: patient.medications,
        },
    };

    return {
        message: "Patient Data parsed",
        data: formattedData,
    };
};

// Get Patient Appointments - // TODO: Check which Id. _id or documentId
const getPatientAppointments = async (
    patientId: string,
    query: Record<string, any>
) => {
    const patient = await prisma.patient.findUnique({
        where: {
            id: patientId,
        },
        select: {
            id: true,
        },
    });
    if (!patient) {
        throw new ApiError(httpStatus.NOT_FOUND, "Patient not Found");
    }

    const queryBuilder = new QueryBuilder(prisma.appointment, query);

    const appointments: (Appointment & {
        specialist: {
            id: string;
            name: string;
        };
        patient: {
            id: true;
            firstName: true;
            lastName: true;
            phone: true;
        };
    })[] = await queryBuilder
        .sort()
        .paginate()
        .include({
            specialist: {
                select: {
                    id: true,
                    name: true,
                },
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
        .rawFilter({
            patientId,
        })
        .execute();
    const pagination = await queryBuilder.countTotal();

    const formattedData = appointments.map((appointment) => {
        const data = {
            id: appointment.id,
            date: appointment.date,
            timeSlot: appointment.timeSlot,
            patient: appointment.patient,
            specialist: appointment.specialist,
            status: appointment.status,
        };

        return data;
    });

    return {
        message: "Patient Appointments parsed",
        data: formattedData,
        pagination,
    };
};

// Get Patient Bonds - // TODO: Check which Id. _id or documentId
const getPatientBonds = async (
    patientId: string,
    query: Record<string, any>
) => {
    const patient = await prisma.patient.findUnique({
        where: {
            id: patientId,
        },
        select: {
            id: true,
        },
    });
    if (!patient) {
        throw new ApiError(httpStatus.NOT_FOUND, "Patient not Found");
    }

    const queryBuilder = new QueryBuilder(prisma.bond, query);

    const bonds: (Bond & {
        discipline: {
            id: string;
            name: string;
        };
        service: {
            id: string;
            name: string;
        };
    })[] = await queryBuilder
        .sort()
        .paginate()
        .include({
            discipline: {
                select: {
                    id: true,
                    name: true,
                },
            },
            service: {
                select: {
                    id: true,
                    name: true,
                },
            },
        })
        .rawFilter({
            patientId,
        })
        .execute();
    const pagination = await queryBuilder.countTotal();

    const formattedData = bonds.map((bond) => {
        const data = {
            id: bond.id,
            name: bond.name,
            discipline: bond.discipline,
            service: bond.service,
            sessions: bond.sessions,
            price: bond.price,
            status: bond.status,
        };

        return data;
    });

    return {
        message: "Patient Bonds parsed",
        data: formattedData,
        pagination,
    };
};

//==============================================
//              Bond Services
//==============================================
// TODO: Not sure what to about this

//==============================================
//              Receipt Services
//==============================================

// Create Receipt
const createReceipt = async (payload: CreateReceiptInput, user: JwtPayload) => {
    const userData = await prisma.user.findUnique({
        where: {
            id: user.id,
        },
        select: {
            clinicId: true,
        },
    });

    const response = await prisma.receipt.create({
        data: {
            ...payload,
            clinicId: userData?.clinicId!,
            products: {
                createMany: {
                    data: payload.products.map((product) => {
                        const data: any = {
                            type: product.type,
                            quantity: product.quantity,
                        };

                        switch (product.type) {
                            case "BOND":
                                data["bondId"] = product.id;
                                break;
                            case "SERVICE":
                                data["serviceId"] = product.id;
                                break;
                            case "VOUCHER":
                                data["voucherId"] = product.id;
                                break;
                            case "OTHER":
                                data["otherId"] = product.id;
                                break;
                        }

                        return data;
                    }),
                },
            },
        },
    });

    return {
        message: "Receipt Created",
        data: {
            id: response.id,
        },
    };
};

// Get Receipts
const getReceipts = async (query: Record<string, any>, user: JwtPayload) => {
    const userData = await prisma.user.findUnique({
        where: {
            id: user.id,
        },
        select: {
            clinicId: true,
        },
    });

    const queryBuilder = new QueryBuilder(prisma.receipt, query);

    const receipts: (Receipt & {
        patient: {
            firstName: string;
            lastName: string;
            email: string;
        };
        products: {
            type: ProductType;
            service: {
                name: string;
            };
        }[];
    })[] = await queryBuilder
        .sort()
        .paginate()
        .rawFilter({
            clinicId: userData?.clinicId,
        })
        .include({
            patient: {
                select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            },
            products: {
                select: {
                    type: true,
                    service: {
                        select: {
                            name: true,
                        },
                    },
                },
            },
        })
        .execute();

    const pagination = await queryBuilder.countTotal();

    const formattedData = receipts.map((receipt) => {
        const data = {
            id: receipt.id,
            patient: { ...receipt.patient },
            product: receipt.products[0]?.service?.name,
            type: receipt.products[0]?.type,

            total: receipt.total,
            paid: receipt.paid,
            due: receipt.total - receipt.paid,
        };

        return data;
    });

    return {
        message: "Receipts parsed",
        data: formattedData,
        pagination,
    };
};

// Get Receipt Details by Id
const getReceiptDetailsById = async (id: string) => {
    const receipt = await prisma.receipt.findUnique({
        where: {
            id,
        },
        include: {
            clinic: {
                select: {
                    address1: true,
                    address2: true,
                    phone: true,
                    email: true,
                    name: true,
                    branding: true,
                },
            },
            patient: true,
            products: {
                include: {
                    bond: true,
                    service: true,
                    voucher: true,
                },
            },
        },
    });

    if (!receipt) {
        throw new ApiError(httpStatus.NOT_FOUND, "Receipt not Found!");
    }

    const formattedData = {
        id: receipt.id,
        patient: {
            id: receipt.patient.id,
            firstName: receipt.patient.firstName,
            lastName: receipt.patient.lastName,
            phone: receipt.patient.phone,
            email: receipt.patient.email,
        },
        branding: receipt.clinic.branding
            ? {
                  ...receipt.clinic.branding,
                  address1: receipt.clinic.address1,
                  address2: receipt.clinic.address2,
                  phone: receipt.clinic.phone,
              }
            : {
                  name: receipt.clinic.name,
                  phone: receipt.clinic.phone,
                  email: receipt.clinic.email,
                  address1: receipt.clinic.address1,
                  address2: receipt.clinic.address2,
              },
        products: receipt.products.map((product) => {
            const data: {
                type: typeof product.type;
                quantity: number;
                name: string | null;
                price: number | null;
                total: number | null;
            } = {
                type: product.type,
                quantity: product.quantity,
                name: null,
                price: null,
                total: null,
            };
            switch (product.type) {
                case "BOND":
                    data["name"] = product.bond?.name!;
                    data["price"] = product.bond?.price!;
                    data["total"] = product.bond?.price! * product.quantity;
                    break;
                case "SERVICE":
                    data["name"] = product.service?.name!;
                    data["price"] = product.service?.price!;
                    data["total"] = product.service?.price! * product.quantity;
                    break;
                case "VOUCHER":
                    data["name"] = product.voucher?.name!;
                    data["price"] = product.voucher?.price!;
                    data["total"] = product.voucher?.price! * product.quantity;
                    break;
                case "OTHER":
                    break;
            }
            return data;
        }),
        tax: receipt.tax,
        discount: receipt.discount,
        paid: receipt.paid,
        subTotal: receipt.subTotal,
        total: receipt.total,
    };
    // (formattedData as any)["subTotal"] = formattedData.products
    //     .filter((p) => p.type === "SERVICE")
    //     .reduce((p, c) => p + c.price! * c.quantity, 0);
    // (formattedData as any)["total"] = applyTaxAndDiscount(
    //     (formattedData as any).subTotal,
    //     formattedData.tax,
    //     formattedData.discount
    // );

    return {
        message: "Receipt Data parsed",
        data: formattedData,
    };
};

// Delete Receipt
const deleteReceipt = async (id: string) => {
    const response = await prisma.receipt.delete({
        where: {
            id,
        },
        select: {
            id: true,
        },
    });

    return {
        message: "Recept Deleted successfully",
        data: {
            id: response.id,
        },
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
//             Communication Services
//==============================================

// Create Reminder Schedules - Only for Clinic Admin
const createReminderSchedules = async (
    payload: CreateReminderScheduleInput,
    user: JwtPayload
) => {
    if (user.role !== UserRole.CLINIC_ADMIN) {
        throw new ApiError(httpStatus.FORBIDDEN, "Unauthorized Request");
    }

    const userData = await prisma.user.findUnique({
        where: {
            id: user.id,
        },
        select: {
            clinicId: true,
        },
    });

    const response = await prisma.reminderSchedule.create({
        data: { ...payload, clinicId: userData?.clinicId! },
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
    if (user.role !== UserRole.CLINIC_ADMIN) {
        throw new ApiError(httpStatus.FORBIDDEN, "Unauthorized Request");
    }

    const userData = await prisma.user.findUnique({
        where: {
            id: user.id,
        },
        select: {
            clinicId: true,
        },
    });

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
                clinicId: userData?.clinicId,
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

//==============================================
//              Voucher Services
//==============================================
// TODO: Not sure what to do about this either!

//==============================================
//              Report Services
//==============================================

// Get basic Report - w/o any change in request - This month
const getClinicBasicReport = async (user: JwtPayload) => {
    const userData = await prisma.user.findUnique({
        where: {
            id: user.id,
        },
        select: {
            clinicId: true,
        },
    });

    const now = new Date();

    // Start of current month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Start of next month
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [receipts, appointments, patients, appointmentsOfServices] =
        await Promise.all([
            prisma.receipt.findMany({
                where: {
                    clinicId: userData?.clinicId!,
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
                        clinicId: userData?.clinicId!,
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
                    clinicId: userData?.clinicId!,
                },
                select: {
                    id: true,
                },
            }),
            prisma.appointment.findMany({
                where: {
                    patient: {
                        clinicId: userData?.clinicId!,
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
    };

    return {
        message: "Basic Report parsed",
        data: formattedData,
    };
};

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
    createAppointment,
    getAppointmentsCount,
    getAppointmentsOverview,
    getAppointmentsCalender,
    getAppointments,

    // Patient Services
    getNewPatientsCount,
    createPatient,
    getPatients,
    getPatientById,
    getPatientAppointments,
    getPatientBonds,

    // Receipt Services
    createReceipt,
    getReceipts,
    getReceiptDetailsById,
    deleteReceipt,

    // Service Services
    getServicesStatistics,
};
