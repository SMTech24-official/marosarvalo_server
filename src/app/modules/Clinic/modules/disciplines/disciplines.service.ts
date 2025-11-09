import { JwtPayload } from "jsonwebtoken";
import prisma from "../../../../../shared/prisma";
import QueryBuilder from "../../../../../utils/queryBuilderV2";

import {
    CreateDisciplineInput,
    UpdateDisciplineInput,
} from "./disciplines.validation";
import ApiError from "../../../../../errors/ApiErrors";
import httpStatus from "http-status";
import { Prisma } from "@prisma/client";

// Get disciplines
const getDisciplines = async (
    query: Record<string, unknown>,
    user: JwtPayload,
) => {
    const queryBuilder = new QueryBuilder<
        typeof prisma.discipline,
        Prisma.$DisciplinePayload
    >(prisma.discipline, query);

    const disciplines = await queryBuilder
        .rawFilter({
            clinicId: user.clinicId,
        })
        .search(["name"])
        .sort()
        .include({
            services: {
                select: {
                    id: true,
                    name: true,
                    price: true,
                },
            },
        })
        .paginate()
        .execute();
    const pagination = await queryBuilder.countTotal();

    const formattedData = disciplines.map((discipline) => {
        const data = {
            id: discipline.id,
            name: discipline.name,
            services: discipline.services,
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
    user: JwtPayload,
) => {
    const response = await prisma.discipline.create({
        data: {
            ...payload,
            clinicId: user.clinicId,
        },
    });

    return {
        message: "New Discipline created",
        data: response,
    };
};

// Update Discipline
const updateDiscipline = async (
    disciplineId: string,
    payload: UpdateDisciplineInput,
    user: JwtPayload,
) => {
    const discipline = await prisma.discipline.findUnique({
        where: {
            id: disciplineId,
            clinic: {
                specialists: {
                    some: {
                        id: user.id,
                    },
                },
            },
        },
        select: {
            id: true,
        },
    });

    if (!discipline) {
        throw new ApiError(httpStatus.NOT_FOUND, "Discipline not found");
    }

    const response = await prisma.discipline.update({
        where: { id: discipline.id },
        data: { ...payload },
    });

    return {
        message: "Discipline Data updated",
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

// Get Disciplines for Appointment
const getAppointmentDisciplines = async (user: JwtPayload) => {
    const disciplines = await prisma.discipline.findMany({
        where: {
            clinicId: user.clinicId,
        },
        select: {
            id: true,
            name: true,
            services: {
                select: {
                    id: true,
                    name: true,
                    price: true,
                },
            },
            staff: {
                where: {
                    role: "SPECIALIST",
                },
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });

    const formattedData = disciplines.map((discipline) => {
        const data = {
            id: discipline.id,
            name: discipline.name,
            services: discipline.services,
            specialists: discipline.staff,
        };

        return data;
    });

    return {
        message: "Disciplines Data parsed",
        data: formattedData,
    };
};

export default {
    getDisciplines,
    createDiscipline,
    updateDiscipline,
    deleteDiscipline,
    getAppointmentDisciplines,
};
