import { Router } from "express";
import CommunicationControllers from "./communication.controller";
import validateRequest from "../../../../middlewares/validateRequest";
import communicationValidations from "./communication.validation";

const router = Router();

// Create Reminder Schedule
router.post(
    "/reminders",
    validateRequest(communicationValidations.createReminderScheduleSchema),
    CommunicationControllers.createReminderSchedules,
);

// Get Reminder Schedules
router.get("/reminders", CommunicationControllers.getReminderSchedules);

// Update Reminder Schedule
router.patch(
    "/reminders/:id",
    validateRequest(communicationValidations.updateReminderScheduleSchema),
    CommunicationControllers.updateSchedule,
);

// Delete Reminder Schedule
router.delete("/reminders/:id", CommunicationControllers.deleteSchedule);

// Update Reminder Status
router.patch(
    "/reminders/:id/status/:status",
    CommunicationControllers.updateReminderStatus,
);

// Get Reminder History
router.get(
    "/reminders/history",
    CommunicationControllers.getReminderScheduleHistory,
);

export const CommunicationRoutes = router;
