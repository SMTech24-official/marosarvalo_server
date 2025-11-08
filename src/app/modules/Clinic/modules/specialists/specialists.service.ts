import { JwtPayload } from "jsonwebtoken";
import { getDateRange } from "../../clinic.utils";
import prisma from "../../../../../shared/prisma";
import { FilterBy } from "../../../Admin/admin.service";

// Get Specialists Count
const getSpecialistsCount = async (
    query: {
        filterBy: Exclude<FilterBy, "year">
    },
    user: JwtPayload,
) => {
    const count = await prisma.user.count({
        where: {
            clinicId: user.clinicId,
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
