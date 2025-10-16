import prisma from "../../../shared/prisma";
import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import bcrypt from "bcrypt";
import { type CreateAdminInput } from "./admin.validation";
import QueryBuilder from "../../../utils/queryBuilder";
import {
    Clinic,
    ClinicOrder,
    Subscription,
    SubscriptionStatus,
} from "@prisma/client";
import { groupRevenue } from "./admin.utils";

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

// TODO:  Update subscription create with phone
const getAllBookings = async (query: Record<string, any>) => {
    const queryBuilder = new QueryBuilder(prisma.subscription, query);

    const subscriptions: (Subscription & {
        clinic?: Clinic;
    })[] = await queryBuilder
        .search(["name", "email"])
        .sort()
        .paginate()
        .execute({
            select: {
                clinic: {
                    select: {
                        id: true,
                    },
                },
            },
        });

    const pagination = await queryBuilder.countTotal();

    const formattedData = subscriptions.map((subscription) => {
        const data = {
            id: subscription.id,
            name: subscription.name,
            email: subscription.email,
            phone: subscription.phone,

            status: subscription.clinic ? "COMPLETE" : "PENDING",
        };

        return data;
    });

    return {
        message: "Bookings data fetched",
        data: formattedData,
        pagination,
    };
};

// Get All Payments
const getAllPaymentHistory = async (query: Record<string, any>) => {
    const queryBuilder = new QueryBuilder(prisma.subscription, query);

    const subscriptions: (Subscription & {
        package: {
            price: number;
        };
    })[] = await queryBuilder
        .search(["name", "email"])
        .sort()
        .paginate()
        .execute({
            select: {
                package: {
                    select: { price: true },
                },
            },
        });

    const pagination = await queryBuilder.countTotal();

    const formattedData = subscriptions.map((subscription) => {
        const data = {
            id: subscription.id,
            name: subscription.name,
            email: subscription.email,
            price: subscription.package.price,
            transactionId: subscription.transactionId,
            status: subscription.status,
            createdAt: subscription.createdAt,
        };

        return data;
    });

    return {
        message: "Payments data fetched",
        data: formattedData,
        pagination,
    };
};

export default {
    getAdminDashboardStats,
    createNewAdmin,
    getAllBookings,
    getAllPaymentHistory,
};
