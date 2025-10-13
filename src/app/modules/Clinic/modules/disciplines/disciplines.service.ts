import { JwtPayload } from "jsonwebtoken";
import prisma from "../../../../../shared/prisma";
import QueryBuilder from "../../../../../utils/queryBuilder";
import { getUserClinicId } from "../../clinic.utils";

// Get disciplines
const getDisciplines = async (query: Record<string, any>, user: JwtPayload) => {
    const clinicId = await getUserClinicId(user);

    const queryBuilder = new QueryBuilder(prisma.discipline, query);

    // ...existing code...
    // You may want to add filtering, sorting, pagination, etc. as in clinic.service.ts
    return await queryBuilder.execute();
};

// Create discipline
const createDiscipline = async (
    payload: any, // Replace with CreateDisciplineInput
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
        message: "Discipline created",
        data: response,
    };
};

// Update Discipline
const updateDiscipline = async (
    disciplineId: string,
    payload: any, // Replace with UpdateDisciplineInput
    user: JwtPayload
) => {
    const clinicId = await getUserClinicId(user);

    const response = await prisma.discipline.update({
        where: { id: disciplineId },
        data: {
            ...payload,
            clinicId: clinicId,
        },
    });

    return {
        message: "Discipline updated",
        data: response,
    };
};

// Delete Discipline
const deleteDiscipline = async (disciplineId: string, user: JwtPayload) => {
    const clinicId = await getUserClinicId(user);

    const response = await prisma.discipline.delete({
        where: { id: disciplineId },
    });

    return {
        message: "Discipline deleted",
        data: response,
    };
};

export default {
    getDisciplines,
    createDiscipline,
    updateDiscipline,
    deleteDiscipline,
};
