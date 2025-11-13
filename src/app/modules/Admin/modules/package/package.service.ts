import { ActivityStatus } from "@prisma/client";
import prisma from "../../../../../shared/prisma";
import { CreatePackageInput, UpdatePackageInput } from "./package.validation";
import ApiError from "../../../../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";

// Create Package
const createPackage = async (payload: CreatePackageInput) => {
    const response = await prisma.package.create({
        data: {
            ...payload,
        },
    });

    return {
        message: "Package Created successfully",
        data: response,
    };
};

// Get All Packages
const getAllPackages = async () => {
    const response = await prisma.package.findMany();

    return {
        message: "Packages Data parsed",
        data: response,
    };
};

// Get Single Package
const getSinglePackage = async (id: string) => {
    const response = await prisma.package.findUnique({
        where: {
            id,
        },
    });

    return {
        message: "Package Data parsed",
        data: response,
    };
};

// Update Package
const updatePackage = async (id: string, payload: UpdatePackageInput) => {
    const response = await prisma.package.update({
        where: {
            id,
        },
        data: {
            ...payload,
        },
    });

    return {
        message: "Package Updated successfully",
        data: response,
    };
};

// Delete Package
const deletePackage = async (id: string) => {
    const response = await prisma.package.delete({
        where: {
            id,
        },
    });

    return {
        message: "Package Deleted successfully",
        data: response,
    };
};

// Update Package Status
const updatePackageStatus = async (id: string, status: ActivityStatus) => {
    if (!Object.values(ActivityStatus).includes(status)) {
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            `Invalid Status. Supported: ${Object.values(ActivityStatus).join(
                ", ",
            )}`,
        );
    }

    const packageData = await prisma.package.findUnique({
        where: { id },
    });

    if (!packageData) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Clinic not found");
    }

    if (packageData.status === status) {
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            `Package status is already ${status}`,
        );
    }

    const response = await prisma.package.update({
        where: {
            id,
        },
        data: {
            status: status,
        },
    });

    return {
        message: "Package Status Updated successfully",
        data: response,
    };
};

export default {
    createPackage,
    getAllPackages,
    getSinglePackage,
    updatePackage,
    deletePackage,
    updatePackageStatus
};
