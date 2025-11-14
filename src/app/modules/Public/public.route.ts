import { Router } from "express";
import PublicControllers from "./public.controller";

const router = Router();

// Get Active Packages
router.get("/packages", PublicControllers.getActivePackages);

export const PublicRoutes = router;
