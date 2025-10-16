import { JwtPayload } from "jsonwebtoken";
import prisma from "../../../../../shared/prisma";
import {
    UpdateBrandingInfoInput,
    UpdateClinicInfoInput,
} from "./settings.validation";

// Get basic Info about clinic
const getBasicInfo = async (user: JwtPayload) => {
    const userData = await prisma.user.findUnique({
        where: {
            id: user.id,
        },
        include: {
            clinic: true,
        },
    });

    const clinic = userData?.clinic!;

    const formattedData = {
        name: clinic.name,
        phone: clinic.phone,
        email: clinic.email,
        address1: clinic.address1,
        address2: clinic.address2,
    };

    return {
        message: "Clinic Data parsed",
        data: formattedData,
    };
};

// Update clinic info
const updateClinicInfo = async (
    payload: UpdateClinicInfoInput,
    user: JwtPayload
) => {
    const response = await prisma.user.update({
        where: {
            id: user.id,
        },
        data: {
            clinic: {
                update: {
                    data: {
                        ...payload,
                    },
                },
            },
        },
        include: {
            clinic: true,
        },
    });

    const clinic = response.clinic!;

    const formattedData = {
        name: clinic.name,
        phone: clinic.phone,
        email: clinic.email,
        address1: clinic.address1,
        address2: clinic.address2,
    };

    return {
        message: "Clinic Data updated",
        data: formattedData,
    };
};

// Get Branding info
const getBrandingInfo = async (user: JwtPayload) => {
    const userData = await prisma.user.findUnique({
        where: {
            id: user.id,
        },
        include: {
            clinic: {
                select: {
                    branding: true,
                },
            },
        },
    });

    return {
        message: "Branding Info parsed",
        data: userData?.clinic?.branding,
    };
};

// Update Branding Info
const updateBrandingInfo = async (
    payload: UpdateBrandingInfoInput,
    user: JwtPayload
) => {
    const response = await prisma.user.update({
        where: {
            id: user.id,
        },
        data: {
            clinic: {
                update: {
                    branding: {
                        upsert: {
                            create: {
                                ...payload,
                            },
                            update: {
                                ...payload,
                            },
                        },
                    },
                },
            },
        },
        select: {
            clinic: {
                select: {
                    branding: true,
                },
            },
        },
    });

    return {
        message: "Branding Info updated",
        data: response.clinic?.branding,
    };
};

// Get Subscription data
const getSubscriptionData = async (user: JwtPayload) => {
    // const subscription = await prisma.subscription.
};

// Export functions
export default {
    getBasicInfo,
    updateClinicInfo,
    getBrandingInfo,
    updateBrandingInfo,
};
