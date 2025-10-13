import { JwtPayload } from "jsonwebtoken";
import { getDateRange, getUserClinicId } from "../../clinic.utils";
import prisma from "../../../../../shared/prisma";

// Get Specialists Count
const getSpecialistsCount = async (
    query: {
        filterBy: "day" | "week" | "month" | undefined;
    },
    user: JwtPayload
) => {
    const clinicId = await getUserClinicId(user);

    const count = await prisma.user.count({
        where: {
            clinicId: clinicId,
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
    getSpecialistsCount,
};
