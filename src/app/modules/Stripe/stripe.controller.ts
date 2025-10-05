import type { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import StripeServices from "./stripe.service";

// Create Stripe Checkout Order
const createCheckoutRequest = catchAsync(
    async (req: Request, res: Response) => {
        const result = await StripeServices.createCheckoutRequest(req.body);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.CREATED,
            message: result.message,
            data: result.data,
        });
    }
);

export default { createCheckoutRequest };
