import { Router } from "express";
import CommunicationControllers from "./communication.controller";
import validateRequest from "../../../../middlewares/validateRequest";
import communicationValidations from "./communication.validation";

const router = Router();

// Create Reminder Schedule
router.post(
    "/reminders",
    validateRequest(communicationValidations.createReminderScheduleSchema),
    CommunicationControllers.createReminderSchedules
);

// Get Reminder History
router.get(
    "/reminders/history",
    CommunicationControllers.getReminderScheduleHistory
);

export const CommunicationRoutes = router;
