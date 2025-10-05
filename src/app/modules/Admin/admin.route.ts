import { Router } from "express";
import AdminControllers from "./admin.controller";
import validateRequest from "../../middlewares/validateRequest";
import AdminValidations from "./admin.validation";

const router = Router();

// Get Admin Dashboard Stats
router.get("/stats", AdminControllers.getAdminDashboardStats);

// Create new Admin
router.post(
    "/administrators",
    validateRequest(AdminValidations.createAdminSchema),
    AdminControllers.createNewAdmin
);

// Get All Bookings
router.get("/bookings", AdminControllers.getAllBookings);

// Create new Clinic
router.post(
    "/clinic",
    validateRequest(AdminValidations.createClinicSchema),
    AdminControllers.createNewClinic
);

// Get all Clinic
router.get("/clinic", AdminControllers.getAllClinic);

export const AdminRoutes = router;
