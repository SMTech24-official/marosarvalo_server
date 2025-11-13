import prisma from "../../../shared/prisma";
import QueryBuilder from "../../../utils/queryBuilder";
import httpStatus from "http-status";
import config from "../../../config";

// Get Active Packages
const getActivePackages = async () => {
    const packages = await prisma.package.findMany({
        where: {
            status: "ACTIVE",
        },
    });

    return {
        message: "Active Packages retrieved successfully",
        data: packages,
    };
};

export default {
    getActivePackages,
};
