import { Router } from "express";
import PublicControllers from "./public.controller";
import auth from "../../middlewares/auth";
import PublicValidations from "./public.validation";

const router = Router();

// Get Active Packages
router.get("/packages", PublicControllers.getActivePackages);

export const PublicRoutes = router;