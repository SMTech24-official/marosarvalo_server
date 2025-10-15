import ApiError from "../../../../../errors/ApiErrors";
import { hashPassword } from "../../../../../helpers/passwordHelpers";
import prisma from "../../../../../shared/prisma";
import httpStatus from "http-status";
import { CreateClinicInput, UpdateClinicInput } from "./clinic.validation";
import QueryBuilder from "../../../../../utils/queryBuilder";
import { Clinic } from "@prisma/client";
import { getCountdown } from "./clinic.utils";

// Create new Clinic // TODO: Add Clinic to Subscription
const createNewClinic = async (body: CreateClinicInput) => {
    const clinic = body.clinic;
    const user = body.user;

    const hashedPassword = await hashPassword(user.password);

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
                select: { startDate: true, endDate: true },
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

// Get Single Clinic
const getSingleClinic = async (id: string) => {
    const clinic = await prisma.clinic.findUnique({
        where: {
            id,
        },
        include: {
            subscription: {
                select: { startDate: true, endDate: true },
            },
        },
    });

    if (!clinic) {
        throw new ApiError(httpStatus.NOT_FOUND, "Clinic not found");
    }

    const endDate = clinic.subscription?.endDate;
    const countdown = endDate ? getCountdown(new Date(endDate)) : null;

    const formattedData = {
        id: clinic.id,
        name: clinic.name,
        phone: clinic.phone,
        email: clinic.email,
        address1: clinic.address1,
        address2: clinic.address2,
        status: clinic.status,
        subscription: {
            startDate: clinic.subscription?.startDate,
            endDate: clinic.subscription?.endDate,
            countdown,
        },
    };

    return {
        message: "Clinic Data parsed",
        data: formattedData,
    };
};

// Update Clinic
const updateClinic = async (id: string, payload: UpdateClinicInput) => {
    const { clinic, user } = payload;

    if (user && user.password) {
        user.password = await hashPassword(user.password);
    }

    const updatedClinic = await prisma.$transaction(async (transaction) => {
        if (clinic) {
            await transaction.clinic.update({
                where: { id },
                data: {
                    name: clinic.name,
                    email: clinic.email,
                    phone: clinic.phone,
                    address1: clinic.address,
                },
            });
        }

        if (user) {
            await transaction.user.updateMany({
                where: { clinicId: id, role: "CLINIC_ADMIN" },
                data: user,
            });
        }

        return await transaction.clinic.findUnique({
            where: { id },
            select: { id: true },
        });
    });

    if (!updatedClinic) {
        throw new ApiError(httpStatus.NOT_FOUND, "Clinic not found");
    }

    return {
        message: "Clinic Data Updated successfully",
    };
};

// Delete Clinic
// QUS: Will deleting a clinic delete all associated data?
const deleteClinic = async (id: string) => {
    const clinic = await prisma.clinic.findUnique({
        where: { id },
    });

    if (!clinic) {
        throw new ApiError(httpStatus.NOT_FOUND, "Clinic not found");
    }

    await prisma.clinic.delete({
        where: { id },
    });

    return {
        message: "Clinic Deleted Successfully.",
    };
};

export default {
    createNewClinic,
    getAllClinic,
    getSingleClinic,
    updateClinic,
    deleteClinic,
};
