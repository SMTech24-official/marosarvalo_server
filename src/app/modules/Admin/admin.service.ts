import prisma from "../../../shared/prisma";
import httpStatus, { status } from "http-status";
import ApiError from "../../../errors/ApiErrors";
import bcrypt from "bcrypt";
import { CreateClinicInput, type CreateAdminInput } from "./admin.validation";
import QueryBuilder from "../../../utils/queryBuilder";
import {
    Clinic,
    OrderClinicData,
    Subscription,
    SubscriptionStatus,
} from "@prisma/client";
import { getCountdown, groupRevenue } from "./admin.utils";

// Get Admin Dashboard Stats
const getAdminDashboardStats = async (query: {
    filterBy: "day" | "week" | "month" | "year" | undefined;
}) => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const now = new Date();

    const [todaySale, total] = await Promise.all([
        prisma.subscription.count({
            where: {
                status: "PAID",
                paidAt: {
                    gte: startOfToday,
                    lte: now,
                },
            },
        }),
        prisma.subscription.findMany({
            where: { status: "PAID" },
            select: {
                paidAt: true,
                package: {
                    select: {
                        price: true,
                    },
                },
            },
        }),
    ]);

    const totalSale = total.length;
    const totalIncome = total.reduce(
        (prev, curr) => prev + curr.package.price,
        0
    );

    const totalRevenue = groupRevenue(total as any, query.filterBy);

    return {
        message: "Dashboard Stats parsed successfully",
        data: {
            todaySale,
            totalSale,
            totalIncome,
            totalRevenue,
        },
    };
};

// Create new Admin
const createNewAdmin = async (body: CreateAdminInput) => {
    const hashedPassword = await bcrypt.hash(body.password, 12);

    const existing = await prisma.user.findUnique({
        where: { email: body.email },
    });

    if (existing) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Email already Exists");
    }

    const response = await prisma.user.create({
        data: {
            ...body,
            password: hashedPassword,
            role: "SUPER_ADMIN",
        },
        select: {
            id: true,
            email: true,
            role: true,
            address: true,
            phone: true,
            introduction: true,

            createdAt: true,
            updatedAt: true,
        },
    });

    return {
        message: "Admin Created Successfully",
        data: response,
    };
};

// Create new Clinic
const createNewClinic = async (body: CreateClinicInput) => {
    const clinic = body.clinic;
    const user = body.user;

    const hashedPassword = await bcrypt.hash(user.password, 12);

    const [userExists, clinicExists] = await Promise.all([
        prisma.user.findUnique({
            where: { email: user.email },
            select: { id: true },
        }),
        prisma.clinic.findUnique({
            where: { email: clinic.email },
            select: { id: true },
        }),
    ]);

    if (userExists) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "User with Email already Exists"
        );
    }

    if (clinicExists) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Clinic with Email already Exists"
        );
    }

    const response = await prisma.user.create({
        data: {
            ...user,
            password: hashedPassword,
            role: "CLINIC_ADMIN",
            clinic: {
                create: {
                    name: clinic.name,
                    phone: clinic.phone,
                    email: clinic.email,
                    address1: clinic.address,
                    branding: {
                        create: {
                            title: clinic.name,
                            email: clinic.email,
                        },
                    },
                },
            },
        },
    });

    return {
        message: "Clinic and User created Successfully.",
        data: {
            userId: response.id,
            clinicId: response.clinicId,
        },
    };
};

// Get All Bookings
const getAllBookings = async (query: Record<string, any>) => {
    const queryBuilder = new QueryBuilder(prisma.orderClinicData, query);

    const bookings: (OrderClinicData & {
        subscription: {
            status: SubscriptionStatus;
        };
    })[] = await queryBuilder
        .search(["name", "email", "phone"])
        .sort()
        .paginate()
        .include({
            subscription: {
                status: true,
            },
        })
        .execute();
    const pagination = await queryBuilder.countTotal();

    const formattedBookings = bookings.map((booking) => {
        const { subscription, ...data } = booking;

        return {
            ...data,
            status: subscription.status,
        };
    });

    return {
        message: "Bookings data fetched",
        data: formattedBookings,
        pagination,
    };
};

// Get All Clinics
const getAllClinic = async (query: Record<string, any>) => {
    const queryBuilder = new QueryBuilder(prisma.clinic, query);

    const clinics: (Clinic & {
        subscription: { startDate: Date; endDate: Date };
    })[] = await queryBuilder
        .search(["name", "email", "phone"])
        .sort()
        .paginate()
        .include({
            subscription: {
                startDate: true,
                endDate: true,
            },
        })
        .execute();

    const pagination = await queryBuilder.countTotal();

    const formattedClinics = clinics.map((clinic) => {
        const endDate = clinic.subscription.endDate;
        const countdown = getCountdown(new Date(endDate));

        const data = {
            id: clinic.id,
            name: clinic.name,
            phone: clinic.phone,
            email: clinic.email,
            status: clinic.status, // TODO: Add Nodecron Checker to check if subscription has ended. If so, update status
            subscription: {
                startDate: clinic.subscription.startDate,
                endDate: clinic.subscription.endDate,
                countdown,
            },
        };

        return data;
    });

    return {
        message: "Clinic Data fetched Successfully.",
        data: formattedClinics,
        pagination,
    };
};

// Get All Payments - Need more clarification
// const getAllPaymentHistory = async (query: Record<string, any>) => {
//     const queryBuilder = new QueryBuilder(query, prisma.subscription);

//     const clinics: Subscription[] = await queryBuilder
//         .search(["name", "email", "phone"])
//         .sort()
//         .paginate()
//         .include({

//         })
//         .execute();

//     const pagination = await queryBuilder.countTotal();

//     const formattedHistory = clinics.map((clinic) => {
//         const data = {
//             id: clinic.id,
//             name: clinic.name,
//             phone: clinic.phone,
//             email: clinic.email,
//             status: clinic.subscription?.status ?? "PENDING",
//             amount: clinic.subscription?.package?.price ?? "UNKNOWN",

//         };

//         return data;
//     });

//     return {
//         message: "Clinic Data fetched Successfully.",
//         // data: formattedClinics,
//         pagination,
//     };
// };

export default {
    getAdminDashboardStats,
    createNewAdmin,
    createNewClinic,
    getAllBookings,
    getAllClinic,
};
