import { Router } from "express";
import ServiceControllers from "./services.controller";
import validateRequest from "../../../../middlewares/validateRequest";
import clinicValidation from "../../clinic.validation";

const router = Router();

// Get Services Statistics
router.get("/statistics", ServiceControllers.getServicesStatistics);

// Get Services List
router.get("/", ServiceControllers.getServices);

// Create Service
router.post(
    "/",
    validateRequest(clinicValidation.createServiceSchema),
    ServiceControllers.createService
);

// Update Service
router.patch(
    "/:id",
    validateRequest(clinicValidation.updateServiceSchema),
    ServiceControllers.updateService
);

// Delete Service
router.delete("/:id", ServiceControllers.deleteService);

export const ServiceRoutes = router;
