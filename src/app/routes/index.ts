import express from "express";

import auth from "../middlewares/auth";
import { AuthRoutes } from "../modules/Auth/auth.routes";
import { AdminRoutes } from "../modules/Admin/admin.route";
import { MeRoutes } from "../modules/Me/me.route";
import { SpecialistRoutes } from "../modules/Specialist/specialist.route";
import { StripeRoutes } from "../modules/Stripe/stripe.route";

const router = express.Router();

const moduleRoutes = [
    {
        path: "/auth",
        handlers: [AuthRoutes],
    },
    {
        path: "/admin",
        handlers: [auth("SUPER_ADMIN"), AdminRoutes],
    },
    {
        path: "/me",
        handlers: [MeRoutes],
    },
    {
        path: "/specialist",
        handlers: [auth("SPECIALIST"), SpecialistRoutes],
    },
    {
        path: "/stripe",
        handlers: [StripeRoutes],
    },
] satisfies {
    path: string;
    handlers: any[];
}[];

moduleRoutes.forEach((route) => router.use(route.path, ...route.handlers));

export default router;
