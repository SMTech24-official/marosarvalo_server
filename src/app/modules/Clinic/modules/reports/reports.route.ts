import { Router } from "express";
import ReportsControllers from "./reports.controller";

const router = Router();

router.get("/basic", ReportsControllers.getClinicBasicReport);

router.get("/cancellation", ReportsControllers.getCancellationInfo);

export const ReportsRoutes = router;
