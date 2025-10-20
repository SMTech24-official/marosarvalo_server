import prisma from "../../../shared/prisma";
import QueryBuilder from "../../../utils/queryBuilder";
import config from "../../../config";
import { Appointment, Prisma } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";
import { getDateRange } from "./specialist.utils";

// Get Specialist Dashboard Stats - We can't work with this
const getSpecialistDashboardStats = async (query: {}) => {};

// Get Specialists Count
const getSpecialistsCount = async (query: {
    filterBy: "day" | "week" | "month" | undefined;
}) => {
    const count = await prisma.user.count({
        where: {
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

export default {
    getDoctorsCount: getSpecialistsCount,
};
