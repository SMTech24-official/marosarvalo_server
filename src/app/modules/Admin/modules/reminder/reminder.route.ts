import { Router } from "express";
import ReminderControllers from "./reminder.controller";
import ReminderValidations from "./reminder.validation";
import validateRequest from "../../../../middlewares/validateRequest";

const router = Router();

router.post(
    "/send",
    validateRequest(ReminderValidations.sendReminderSchema),
    ReminderControllers.sendReminder,
);

router.get("/", ReminderControllers.getReminders);

export const ReminderRoutes = router;
