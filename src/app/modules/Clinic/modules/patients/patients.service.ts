import prisma from "../../../../../shared/prisma";
import QueryBuilder from "../../../../../utils/queryBuilder";
import { Appointment, Bond, Patient } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";
import { getDateRange } from "../../clinic.utils";
import ApiError from "../../../../../errors/ApiErrors";
import httpStatus from "http-status";
import { CreatePatientInput } from "./patients.validation";
import { getNewestDate } from "./patients.utils";
import { getMaxSequence } from "../../../../../utils";

// Get New Patients Count
const getNewPatientsCount = async (
    query: {
        filterBy: "day" | "week" | "month" | undefined;
    },
    user: JwtPayload
) => {
    const count = await prisma.patient.count({
        where: {
            clinicId: user.clinicId,
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
    const response = await prisma.patient.create({
        data: {
            ...payload,
            id:
                (await getMaxSequence({ model: prisma.patient, next: true })) ??
                0,
            clinicId: user.clinicId,
        },
    });

    return {
        message: "New Patient created",
        data: response,
    };
};

// Get Patients
const getPatients = async (query: Record<string, any>, user: JwtPayload) => {
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
            clinicId: user.clinicId,
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
const getPatientById = async (patientId: number) => {
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
    patientId: number,
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
    patientId: number,
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

// Search Patient
const searchPatient = async (
    query: { searchTerm?: string },
    user: JwtPayload
) => {
    if (!query.searchTerm) {
        throw new ApiError(httpStatus.BAD_REQUEST, "searchTerm is required");
    }

    const patients = await prisma.patient.findMany({
        where: {
            clinicId: user.clinicId,
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
                {
                    phone: {
                        contains: query.searchTerm,
                        mode: "insensitive",
                    },
                },
                {
                    email: {
                        contains: query.searchTerm,
                        mode: "insensitive",
                    },
                },
            ],
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
            bonds: true,
        },
        take: 10, // Limit to 10 results for search suggestions
    });

    const formattedData = patients.map((patient) => {
        return {
            id: patient.id,
            name: `${patient.firstName}${
                patient.lastName ? " " + patient.lastName : ""
            }`,
            phone: patient.phone,
            email: patient.email,
            bonds: patient.bonds,
        };
    });

    return {
        message: "Patient search result",
        data: formattedData,
    };
};

export default {
    getNewPatientsCount,
    createPatient,
    getPatients,
    getPatientById,
    getPatientAppointments,
    getPatientBonds,
    searchPatient,
};
