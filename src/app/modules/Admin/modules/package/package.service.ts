import prisma from "../../../../../shared/prisma";
import { CreatePackageInput, UpdatePackageInput } from "./package.validation";

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

export default {
    createPackage,
    getAllPackages,
    getSinglePackage,
    updatePackage,
    deletePackage,
};
