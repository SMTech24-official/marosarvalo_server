import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import { StatusCodes } from "http-status-codes";
import { CreateClinicInput } from "./stripe.validation";

// Create checkout request
const createCheckoutRequest = async (payload: CreateClinicInput) => {
    const { clinic, user, package: packageId } = payload;

    const packageData = await prisma.package.findUnique({
        where: {
            id: packageId,
        },
    });

    if (!packageData) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Package Not Found");
    }

    // TODO: Do what needs to be done
    // Create Stripe Instance
    const stripe = {
        transactionId: "inFuture",
        url: "http://localhost:5000/",
    };

    //  Create Temp Data
    const response = await prisma.clinicOrder.create({
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
                    phone: clinic.phone,
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
