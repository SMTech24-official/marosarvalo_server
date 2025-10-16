import { Router } from "express";
import AdminControllers from "./admin.controller";
import validateRequest from "../../middlewares/validateRequest";
import AdminValidations from "./admin.validation";
import moduleRoutes from "./routes";

const router = Router();

moduleRoutes.forEach((route) => router.use(route.path, ...route.handlers));

// Get Admin Dashboard Stats
router.get("/stats", AdminControllers.getAdminDashboardStats);

// Create new Admin
router.post(
    "/administrators",
    validateRequest(AdminValidations.createAdminSchema),
    AdminControllers.createNewAdmin,
);

// Get All Bookings
router.get("/bookings", AdminControllers.getAllBookings);

// Get All Payment history
router.get("/payment", AdminControllers.getAllPaymentHistory);

export const AdminRoutes = router;
