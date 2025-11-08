import { Router } from "express";
import ReminderControllers from "./reminder.controller";
import validateRequest from "../../../../middlewares/validateRequest";
import reminderValidations from "./reminder.validation";

const router = Router();

// Create Reminder Schedule
router.post(
    "/",
    validateRequest(reminderValidations.createReminderScheduleSchema),
    ReminderControllers.createReminderSchedules,
);

// Get Reminder Schedules
router.get("/", ReminderControllers.getReminderSchedules);

// Update Reminder Schedule
router.patch(
    "/:id",
    validateRequest(reminderValidations.updateReminderScheduleSchema),
    ReminderControllers.updateSchedule,
);

// Delete Reminder Schedule
router.delete("/:id", ReminderControllers.deleteSchedule);

// Update Reminder Status
router.patch("/:id/:status", ReminderControllers.updateReminderStatus);

// Get Reminder History
router.get("/history", ReminderControllers.getReminderScheduleHistory);

export const ReminderRoutes = router;
