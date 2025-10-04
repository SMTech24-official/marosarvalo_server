import { Router } from "express";
import AdminControllers from "./admin.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { parseBodyData } from "../../middlewares/parseBodyData";
import validateRequest from "../../middlewares/validateRequest";
import AdminValidations from "./admin.validation";

const router = Router();

// Create new Admin
router.post(
    "/administrators",
    auth("SUPER_ADMIN"),
    validateRequest(AdminValidations.createAdminSchema),
    AdminControllers.createNewAdmin
);

// Create new Clinic
router.post(
    "/clinic",
    auth("SUPER_ADMIN"),
    validateRequest(AdminValidations.createClinicSchema),
    AdminControllers.createNewClinic
);

// Get all Clinic
router.get("/clinic", auth("SUPER_ADMIN"), AdminControllers.getAllClinic);

export const AdminRoutes = router;
