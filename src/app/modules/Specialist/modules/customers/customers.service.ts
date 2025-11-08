import prisma from "../../../../../shared/prisma";
import { JwtPayload } from "jsonwebtoken";
import { FilterBy, getDateRange } from "../../specialist.utils";

// Get Appointments Count
const getNewCustomersCount = async (
    query: {
        filterBy: Exclude<FilterBy, "year">;
    },
    user: JwtPayload,
) => {
    const userData = await prisma.user.findUnique({
        where: {
            id: user.id,
        },
    });

    const count = await prisma.patient.count({
        where: {
            appointments: {
                some: {
                    specialistId: userData?.id,
                },
            },
            clinicId: userData?.clinicId as string,
            createdAt: getDateRange(query.filterBy),
        },
    });

    return {
        message: "Doctors Count parsed.",
        count: count,
    };
};

export default { getNewCustomersCount };
