import { Router } from "express";
import DisciplineControllers from "./disciplines.controller";
import validateRequest from "../../../../middlewares/validateRequest";
import clinicValidation from "../../clinic.validation";

const router = Router();

// Get Disciplines
router.get("/", DisciplineControllers.getDisciplines);

// Create Discipline
router.post(
    "/",
    validateRequest(clinicValidation.createDisciplineSchema),
    DisciplineControllers.createDiscipline
);

// Update Discipline
router.patch(
    "/:id",
    validateRequest(clinicValidation.updateDisciplineSchema),
    DisciplineControllers.updateDiscipline
);

// Delete Discipline
router.delete("/:id", DisciplineControllers.deleteDiscipline);

export const DisciplineRoutes = router;
