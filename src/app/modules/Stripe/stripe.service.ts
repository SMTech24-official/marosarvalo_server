import prisma from "../../../shared/prisma";
import QueryBuilder from "../../../utils/queryBuilder";
import config from "../../../config";
import { Prisma } from "@prisma/client";
import { CreateClinicInput } from "./stripe.validation";

// Create checkout request
const createCheckoutRequest = async (payload: CreateClinicInput) => {
    const { clinic, user, package: packageId } = payload;

    // Create Stripe Instance
    const stripe = {
        transactionId: "inFuture",
        url: "http://localhost:5000/",
    };

    //  Create Temp Data
    const response = await prisma.orderClinicData.create({
        data: {
            name: clinic.name,
            email: clinic.email,
            phone: clinic.phone,
            address: clinic.address,

            userEmail: user.email,
            userName: user.name,
            userPhone: user.phone,
            userAddress: user.address,

            subscription: {
                create: {
                    name: clinic.name,
                    email: clinic.email,
                    transactionId: stripe.transactionId,
                    packageId: packageId,
                },
            },
        },
    });

    return {
        message: "Order Created Successfully",
        data: {
            url: stripe.url,
            orderId: response.id,
        },
    };
};

export default { createCheckoutRequest };
