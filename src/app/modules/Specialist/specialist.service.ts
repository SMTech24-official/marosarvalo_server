import prisma from "../../../shared/prisma";
import { FilterBy, getDateRange } from "./specialist.utils";

// Get Specialist Dashboard Stats - We can't work with this
// const getSpecialistDashboardStats = async (query: {}) => {};

// Get Specialists Count
const getSpecialistsCount = async (query: {
    filterBy: Exclude<FilterBy, "year">;
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
