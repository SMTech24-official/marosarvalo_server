import express from "express";

import auth from "../middlewares/auth";
import { AuthRoutes } from "../modules/Auth/auth.routes";
import { AdminRoutes } from "../modules/Admin/admin.route";
import { MeRoutes } from "../modules/Me/me.route";

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
        handlers: [auth(), MeRoutes],
    },
];

moduleRoutes.forEach((route) => router.use(route.path, ...route.handlers));

export default router;
