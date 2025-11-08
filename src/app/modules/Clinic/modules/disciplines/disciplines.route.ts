import { Router } from "express";
import DisciplineControllers from "./disciplines.controller";
import validateRequest from "../../../../middlewares/validateRequest";
import disciplineValidations from "./disciplines.validation";

const router = Router();

// Get Disciplines
router.get("/", DisciplineControllers.getDisciplines);

// Create Discipline
router.post(
    "/",
    validateRequest(disciplineValidations.createDisciplineSchema),
    DisciplineControllers.createDiscipline,
);

// Update Discipline
router.patch(
    "/:id",
    validateRequest(disciplineValidations.updateDisciplineSchema),
    DisciplineControllers.updateDiscipline,
);

// Delete Discipline
router.delete("/:id", DisciplineControllers.deleteDiscipline);

// Get Disciplines for Appointment
router.get(
    "/appointments",
    DisciplineControllers.getAppointmentDisciplines,
);

export const DisciplineRoutes = router;
