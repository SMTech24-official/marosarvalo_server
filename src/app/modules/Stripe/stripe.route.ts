import { Router } from "express";
import StripeControllers from "./stripe.controller";
import StripeValidations from "./stripe.validation";
import validateRequest from "../../middlewares/validateRequest";

const router = Router();

// Create Stripe Checkout Order
router.post(
    "/",
    validateRequest(StripeValidations.createClinicSchema),
    StripeControllers.createCheckoutRequest,
);

export const StripeRoutes = router;
