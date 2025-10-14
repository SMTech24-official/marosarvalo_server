import { JwtPayload } from "jsonwebtoken";
import prisma from "../../../../../shared/prisma";
import QueryBuilder from "../../../../../utils/queryBuilder";
import { getUserClinicId } from "../../clinic.utils";
import {
    CreateDisciplineInput,
    UpdateDisciplineInput,
} from "./disciplines.validation";
import ApiError from "../../../../../errors/ApiErrors";
import httpStatus from "http-status";
import { Discipline } from "@prisma/client";

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

export default {
    getDisciplines,
    createDiscipline,
    updateDiscipline,
    deleteDiscipline,
};
