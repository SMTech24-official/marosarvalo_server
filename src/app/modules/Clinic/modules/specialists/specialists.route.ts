import { Router } from "express";
import SpecialistController from "./specialists.controller";

const router = Router();

router.get("/specialists/count", SpecialistController.getSpecialistsCount);

export const SpecialistRoutes = router;
