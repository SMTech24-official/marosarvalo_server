import { Router } from "express";
import moduleRoutes from "./routes";

const router = Router();

moduleRoutes.forEach((route) => router.use(route.path, ...route.handlers));

export const ClinicRoutes = router;
