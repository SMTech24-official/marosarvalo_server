import { Router } from "express";
import ClinicControllers from "./clinic.controller";
import validateRequest from "../../../../middlewares/validateRequest";
import ClinicValidations from "./clinic.validation";

const router = Router();

// Create new Clinic
router.post(
    "/",
    validateRequest(ClinicValidations.createClinicSchema),
    ClinicControllers.createNewClinic,
);

// Get all Clinic
router.get("/", ClinicControllers.getAllClinic);

// Get single Clinic
router.get("/:id", ClinicControllers.getSingleClinic);

// Update Clinic
router.patch(
    "/:id",
    validateRequest(ClinicValidations.updateClinicSchema),
    ClinicControllers.updateClinic,
);

// Delete Clinic
router.delete("/:id", ClinicControllers.deleteClinic);

export const ClinicRoutes = router;
