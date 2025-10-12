import prisma from "../../../shared/prisma";
import QueryBuilder from "../../../utils/queryBuilder";
import {
    Appointment,
    Bond,
    CommunicationMethod,
    Discipline,
    Patient,
    Product,
    ProductType,
    Receipt,
    ReminderScheduleType,
    ScheduledReminderHistory,
    Service,
    Staff,
    UserRole,
} from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";
import {
    applyTaxAndDiscount,
    countServices,
    getAttendanceStats,
    getDateRange,
    getNewestDate,
    getUserClinicId,
    getWeeklyStats,
    groupAppointment,
    parseTimeString,
} from "./clinic.utils";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import {
    CreateAppointmentInput,
    CreateDisciplineInput,
    CreatePatientInput,
    CreateReceiptInput,
    CreateReminderScheduleInput,
    CreateServiceInput,
    CreateStaffInput,
    UpdateBrandingInfoInput,
    UpdateClinicInfoInput,
    UpdateDisciplineInput,
    UpdateServiceInput,
    UpdateStaffInput,
} from "./clinic.validation";
import { hashPassword } from "../../../helpers/passwordHelpers";

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
    const clinicId = await getUserClinicId(user);

    const count = await prisma.user.count({
        where: {
            clinicId: clinicId,
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
    const clinicId = await getUserClinicId(user);

    const count = await prisma.patient.count({
        where: {
            clinicId: clinicId,
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
    const clinicId = await getUserClinicId(user);

    const response = await prisma.patient.create({
        data: {
            ...payload,
            clinicId: clinicId,
        },
    });

    return {
        message: "New Patient created",
        data: response,
    };
};

// Get Patients
const getPatients = async (query: Record<string, any>, user: JwtPayload) => {
    const clinicId = await getUserClinicId(user);

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
            clinicId: clinicId,
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
    const clinicId = await getUserClinicId(user);

    const response = await prisma.receipt.create({
        data: {
            ...payload,
            clinicId: clinicId,
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
    const clinicId = await getUserClinicId(user);

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
            clinicId: clinicId,
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
//             Communication Services
//==============================================

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

//==============================================
//              Voucher Services
//==============================================
// TODO: Not sure what to do about this either!

//==============================================
//              Report Services
//==============================================

// Get basic Report - w/o any change in request - This month
const getClinicBasicReport = async (user: JwtPayload) => {
    const clinicId = await getUserClinicId(user);

    const now = new Date();

    // Start of current month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Start of next month
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [receipts, appointments, patients, appointmentsOfServices] =
        await Promise.all([
            prisma.receipt.findMany({
                where: {
                    clinicId: clinicId,
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
                        clinicId: clinicId,
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
                    clinicId: clinicId,
                },
                select: {
                    id: true,
                },
            }),
            prisma.appointment.findMany({
                where: {
                    patient: {
                        clinicId: clinicId,
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

// Get revenue by service - IDK! Bond and Voucher is not clear
const getRevenueByService = async () => {};

// Get cancellation Info
const getCancellationInfo = async (
    query: Record<string, any>,
    user: JwtPayload
) => {
    const clinicId = await getUserClinicId(user);

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
                clinicId: clinicId,
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

//==============================================
//             Setting Services
//==============================================

// Get basic Info about clinic
const getBasicInfo = async (user: JwtPayload) => {
    const userData = await prisma.user.findUnique({
        where: {
            id: user.id,
        },
        include: {
            clinic: true,
        },
    });

    const clinic = userData?.clinic!;

    const formattedData = {
        name: clinic.name,
        phone: clinic.phone,
        email: clinic.email,
        address1: clinic.address1,
        address2: clinic.address2,
    };

    return {
        message: "Clinic Data parsed",
        data: formattedData,
    };
};

// Update clinic info
const updateClinicInfo = async (
    payload: UpdateClinicInfoInput,
    user: JwtPayload
) => {
    const response = await prisma.user.update({
        where: {
            id: user.id,
        },
        data: {
            clinic: {
                update: {
                    data: {
                        ...payload,
                    },
                },
            },
        },
        include: {
            clinic: true,
        },
    });

    const clinic = response.clinic!;

    const formattedData = {
        name: clinic.name,
        phone: clinic.phone,
        email: clinic.email,
        address1: clinic.address1,
        address2: clinic.address2,
    };

    return {
        message: "Clinic Data updated",
        data: formattedData,
    };
};

// Get Branding info
const getBrandingInfo = async (user: JwtPayload) => {
    const userData = await prisma.user.findUnique({
        where: {
            id: user.id,
        },
        include: {
            clinic: {
                select: {
                    branding: true,
                },
            },
        },
    });

    return {
        message: "Branding Info parsed",
        data: userData?.clinic?.branding,
    };
};

// Update Branding Info
const updateBrandingInfo = async (
    payload: UpdateBrandingInfoInput,
    user: JwtPayload
) => {
    const response = await prisma.user.update({
        where: {
            id: user.id,
        },
        data: {
            clinic: {
                update: {
                    branding: {
                        upsert: {
                            create: {
                                ...payload,
                            },
                            update: {
                                ...payload,
                            },
                        },
                    },
                },
            },
        },
        select: {
            clinic: {
                select: {
                    branding: true,
                },
            },
        },
    });

    return {
        message: "Branding Info updated",
        data: response.clinic?.branding,
    };
};

//==============================================
//             Service Services
//==============================================

// Get Services Statistics
const getServicesStatistics = async (user: JwtPayload) => {
    const clinicId = await getUserClinicId(user);

    const disciplines = await prisma.discipline.findMany({
        where: {
            clinicId: clinicId!,
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

// Get Services list
const getServices = async (query: Record<string, any>, user: JwtPayload) => {
    const clinicId = await getUserClinicId(user);

    const queryBuilder = new QueryBuilder(prisma.service, query);

    const services: (Service & {
        discipline: {
            name: string;
            id: string;
        };
    })[] = await queryBuilder
        .rawFilter({
            discipline: { clinicId: clinicId },
        })
        .search(["name"])
        .sort()
        .include({
            discipline: {
                select: {
                    id: true,
                    name: true,
                },
            },
        })
        .paginate()
        .execute();
    const pagination = await queryBuilder.countTotal();

    const formattedData: Record<string, any>[] = [];

    services.forEach((service) => {
        formattedData.push({
            id: service.id,
            discipline: { ...service.discipline },
            name: service.name,
            price: service.name,
            duration: service.duration,
        });
    });

    return {
        message: "Services Data parsed",
        data: formattedData,
        pagination,
    };
};

// Create new Service
const createService = async (payload: CreateServiceInput) => {
    const response = await prisma.service.create({
        data: {
            ...payload,
        },
        include: {
            discipline: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });

    return {
        message: "New Service created",

        data: response,
    };
};

// Update Service
const updateService = async (
    serviceId: string,
    payload: UpdateServiceInput,
    user: JwtPayload
) => {
    const service = await prisma.service.findUnique({
        where: {
            id: serviceId,
            discipline: {
                clinic: {
                    specialists: {
                        some: {
                            id: user.id,
                            role: {
                                in: ["CLINIC_ADMIN", "RECEPTIONIST"],
                            },
                        },
                    },
                },
            },
        },
        select: {
            id: true,
        },
    });

    if (!service) {
        throw new ApiError(httpStatus.NOT_FOUND, "Service Not Found!");
    }

    const response = await prisma.service.update({
        where: { id: service.id },
        data: { ...payload },
        select: {
            id: true,
            discipline: {
                select: {
                    id: true,
                    name: true,
                },
            },
            price: true,
            duration: true,
        },
    });

    return {
        message: "Service Data updated",
        data: response,
    };
};

// Delete Service
const deleteService = async (serviceId: string, user: JwtPayload) => {
    const service = await prisma.service.findUnique({
        where: {
            id: serviceId,
            discipline: {
                clinic: {
                    specialists: {
                        some: {
                            id: user.id,
                            role: {
                                in: ["CLINIC_ADMIN", "RECEPTIONIST"],
                            },
                        },
                    },
                },
            },
        },
        select: {
            id: true,
        },
    });

    if (!service) {
        throw new ApiError(httpStatus.NOT_FOUND, "Service Not Found!");
    }

    const response = await prisma.service.delete({
        where: { id: service.id },
        select: {
            id: true,
        },
    });

    return {
        message: "Service deleted successfully",
        data: response,
    };
};

//==============================================
//             Discipline Services
//==============================================

// Get disciplines
const getDisciplines = async (query: Record<string, any>, user: JwtPayload) => {
    const clinicId = await getUserClinicId(user);

    const queryBuilder = new QueryBuilder(prisma.discipline, query);

    const disciplines: Discipline[] = await queryBuilder
        .rawFilter({
            clinicId: clinicId,
        })
        .search(["name"])
        .sort()
        .paginate()
        .execute();
    const pagination = await queryBuilder.countTotal();

    const formattedData = disciplines.map((discipline) => {
        const data = {
            id: discipline.id,
            name: discipline.name,
        };

        return data;
    });

    return {
        message: "Disciplines Data parsed",
        data: formattedData,
        pagination,
    };
};

// Create discipline
const createDiscipline = async (
    payload: CreateDisciplineInput,
    user: JwtPayload
) => {
    const clinicId = await getUserClinicId(user);

    const response = await prisma.discipline.create({
        data: {
            ...payload,
            clinicId: clinicId,
        },
    });

    return {
        message: "New Discipline created",
        data: response,
    };
};

// Update Discipline
const updateDiscipline = async (
    serviceId: string,
    payload: UpdateDisciplineInput,
    user: JwtPayload
) => {
    const discipline = await prisma.discipline.findUnique({
        where: {
            id: serviceId,
            clinic: {
                specialists: {
                    some: {
                        id: user.id,
                        role: {
                            in: ["CLINIC_ADMIN", "RECEPTIONIST"],
                        },
                    },
                },
            },
        },
        select: {
            id: true,
        },
    });

    if (!discipline) {
        throw new ApiError(httpStatus.NOT_FOUND, "Service Not Found!");
    }

    const response = await prisma.discipline.update({
        where: { id: discipline.id },
        data: { ...payload },
    });

    return {
        message: "Service Data updated",
        data: response,
    };
};

// Delete Discipline
const deleteDiscipline = async (disciplineId: string, user: JwtPayload) => {
    const discipline = await prisma.discipline.findUnique({
        where: {
            id: disciplineId,
            clinic: {
                specialists: {
                    some: {
                        id: user.id,
                        role: {
                            in: ["CLINIC_ADMIN", "RECEPTIONIST"],
                        },
                    },
                },
            },
        },
        select: {
            id: true,
        },
    });

    if (!discipline) {
        throw new ApiError(httpStatus.NOT_FOUND, "Discipline Not Found!");
    }

    const response = await prisma.discipline.delete({
        where: { id: discipline.id },
        select: {
            id: true,
        },
    });

    return {
        message: "Discipline deleted successfully",
        data: response,
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

// Create new Staff
const createNewStaff = async (payload: CreateStaffInput, user: JwtPayload) => {
    const clinicId = await getUserClinicId(user);

    const { password, ...rest } = payload;

    const staffData = {
        ...rest,
        clinicId: clinicId,
    };
    let response;

    if (
        payload.role.toUpperCase() === UserRole.SPECIALIST ||
        payload.role.toUpperCase() === UserRole.RECEPTIONIST
    ) {
        if (!password) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                "Password required for Specialist and Receptionist"
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
                    },
                },
            },
            select: {
                staff: true,
            },
        });

        response = res.staff;
    } else {
        response = await prisma.staff.create({
            data: {
                ...staffData,
            },
        });
    }

    return {
        message: "New Staff created",
        data: response,
    };
};

// Get All Staff
const getAllStaff = async (query: Record<string, any>, user: JwtPayload) => {
    const clinicId = await getUserClinicId(user);

    const queryBuilder = new QueryBuilder(prisma.staff, query);

    const staffs: (Staff & {
        discipline: {
            id: string;
            name: string;
        };
    })[] = await queryBuilder
        .rawFilter({
            clinicId: clinicId,
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
const getStaffById = async (staffId: string, user: JwtPayload) => {
    const clinicId = await getUserClinicId(user);

    const staff = await prisma.staff.findUnique({
        where: {
            id: staffId,
            clinicId: clinicId,
        },
    });

    if (!staff) {
        throw new ApiError(httpStatus.NOT_FOUND, "Staff not found!");
    }

    return { message: "Staff Data parsed", data: staff };
};

// Update Staff data
const updateStaffData = async (
    staffId: string,
    payload: UpdateStaffInput,
    user: JwtPayload
) => {
    const clinicId = await getUserClinicId(user);

    const exists = await prisma.staff.findUnique({
        where: {
            id: staffId,
            clinicId,
        },
    });

    if (!exists) {
        throw new ApiError(httpStatus.NOT_FOUND, "Staff not found!");
    }

    const response = await prisma.staff.update({
        where: {
            id: exists.id,
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
const deleteStaffData = async (staffId: string, user: JwtPayload) => {
    const clinicId = await getUserClinicId(user);

    const exists = await prisma.staff.findUnique({
        where: {
            id: staffId,
            clinicId,
        },
    });

    if (!exists) {
        throw new ApiError(httpStatus.NOT_FOUND, "Staff not found!");
    }

    const response = await prisma.staff.delete({
        where: {
            id: exists.id,
        },
    });

    return {
        message: "Staff Data updated",
        data: response,
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

    // Communication Services
    createReminderSchedules,
    getReminderScheduleHistory,

    // Report Services
    getClinicBasicReport,
    getCancellationInfo,

    // Settings Services
    getBasicInfo,
    updateClinicInfo,
    getBrandingInfo,
    updateBrandingInfo,

    // Service Services
    getServices,
    createService,
    updateService,
    deleteService,
    getServicesStatistics,

    // Discipline Services
    getDisciplines,
    createDiscipline,
    updateDiscipline,
    deleteDiscipline,

    // Staff Services
    createNewStaff,
    getAllStaff,
};
