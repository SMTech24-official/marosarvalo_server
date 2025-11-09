import prisma from "../../../../../shared/prisma";
import QueryBuilder from "../../../../../utils/queryBuilderV2";
import { Prisma } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";

import ApiError from "../../../../../errors/ApiErrors";
import httpStatus from "http-status";
import { CreateServiceInput, UpdateServiceInput } from "./services.validation";

// Get Services Statistics
const getServicesStatistics = async (user: JwtPayload) => {
    const disciplines = await prisma.discipline.findMany({
        where: {
            clinicId: user.clinicId!,
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
const getServices = async (
    query: Record<string, unknown>,
    user: JwtPayload,
) => {
    const queryBuilder = new QueryBuilder<
        typeof prisma.service,
        Prisma.$ServicePayload
    >(prisma.service, query);

    const services = await queryBuilder
        .rawFilter({
            discipline: { clinicId: user.clinicId },
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

    const formattedData: Record<string, unknown>[] = [];

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
    user: JwtPayload,
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

export default {
    getServicesStatistics,
    getServices,
    createService,
    updateService,
    deleteService,
};
