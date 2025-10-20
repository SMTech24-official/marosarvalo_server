import { Router } from "express";
import SpecialistControllers from "./specialist.controller";
import moduleRoutes from "./routes";

const router = Router();

moduleRoutes.forEach((route) => router.use(route.path, ...route.handlers));

// Get Specialists Count
router.get("/count", SpecialistControllers.getDoctorsCount);

export const SpecialistRoutes = router;
