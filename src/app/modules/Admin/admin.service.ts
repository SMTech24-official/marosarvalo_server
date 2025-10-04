import prisma from "../../../shared/prisma";
import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import bcrypt from "bcrypt";
import { CreateClinicInput, type CreateAdminInput } from "./admin.validation";
import QueryBuilder from "../../../utils/queryBuilder";
import { Clinic, Subscription } from "@prisma/client";

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

            // TODO: Add more fields

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

const getCountdown = (targetDate: Date) => {
    const now = new Date(); // system-local tz, same as target if target is Date
    const diffMs = targetDate.getTime() - now.getTime();

    if (diffMs <= 0) {
        return { days: 0, hours: 0, minutes: 0 };
    }

    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const minutes = totalMinutes % 60;

    return { days, hours, minutes };
};

// Get All Clinics
const getAllClinic = async (query: Record<string, any>) => {
    const queryBuilder = new QueryBuilder(query, prisma.clinic);

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
            status: "ACTIVE", // TODO: Figure out where is this status coming from
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

export default { createNewAdmin, createNewClinic, getAllClinic };
