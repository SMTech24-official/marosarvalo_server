import prisma from "../../../../../shared/prisma";
import QueryBuilder from "../../../../../utils/queryBuilderV2";
import { CompletionStatus } from "@prisma/client";

// CRUD

// const createBookings = async (payload: any) => {
//     const result = await prisma.clinicOrder.create({
//         data: payload,
//     });
//     return result;
// };

// Get All Bookings
const getAllBookings = async (query: Record<string, unknown>) => {
    const BookingsQuery = new QueryBuilder(prisma.clinicOrder, query)
        .search([
            "name",
            "email",
            "phone",
            "userName",
            "userEmail",
            "userPhone",
        ])
        .paginate()
        .sort()
        .fields();

    const result = await BookingsQuery.execute();
    const pagination = await BookingsQuery.countTotal();

    return {
        pagination,
        result,
    };
};

// Get Single Booking
const getSingleBookings = async (id: string) => {
    const result = await prisma.clinicOrder.findUnique({
        where: {
            id,
        },
    });
    return result;
};

// const updateBookings = async (id: string, payload: any) => {
//     const result = await prisma.clinicOrder.update({
//         where: {
//             id,
//         },
//         data: payload,
//     });
//     return result;
// };

// Delete Bookings
const deleteBookings = async (id: string) => {
    const result = await prisma.clinicOrder.delete({
        where: {
            id,
        },
    });
    return result;
};

// Update Booking Status
const updateBookingStatus = async (id: string, status: CompletionStatus) => {
    // Check validity of status
    if (!Object.values(CompletionStatus).includes(status)) {
        throw new Error(
            `Invalid status. Supported: ${Object.values(CompletionStatus).join(
                ", ",
            )}`,
        );
    }

    const result = await prisma.clinicOrder.update({
        where: {
            id,
        },
        data: {
            status: status,
        },
    });
    return result;
};

export default {
    getAllBookings,
    getSingleBookings,
    deleteBookings,
    updateBookingStatus,
};
