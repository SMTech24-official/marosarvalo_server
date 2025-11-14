import { Router } from "express";
import StaffControllers from "./staff.controller";
import validateRequest from "../../../../middlewares/validateRequest";
import staffValidations from "./staff.validation";

const router = Router();

// Create New Staff
router.post(
    "/",
    validateRequest(staffValidations.createStaffSchema),
    StaffControllers.createNewStaff,
);

// Get Staff Schedules
router.get("/schedules", StaffControllers.getStaffSchedules);

// Get All Staff
router.get("/", StaffControllers.getAllStaff);

// Get single Staff
router.get("/:id", StaffControllers.getStaffById);

// Update Staff data
router.patch(
    "/:id",
    validateRequest(staffValidations.updateStaffSchema),
    StaffControllers.updateStaffData,
);

// Delete Staff data
router.delete("/:id", StaffControllers.deleteStaffData);

// Update Staff Working Hours
router.patch(
    "/:id/working-hours",
    validateRequest(staffValidations.updateWorkingHoursSchema),
    StaffControllers.updateWorkingHours,
);

// Get Staff Working Hours
router.get("/:id/working-hours", StaffControllers.getWorkingHours);

// Insert Staff Holiday
router.post(
    "/:id/holiday",
    validateRequest(staffValidations.insertHolidayInput),
    StaffControllers.insertHoliday,
);

// Get All Staff Holidays
router.get("/:id/holiday", StaffControllers.getAllHolidays);

// Update Staff Holiday
router.patch(
    "/holiday/:id",
    validateRequest(staffValidations.updateHolidayInput),
    StaffControllers.updateHoliday,
);

// Delete Staff Holiday
router.delete("/holiday/:id", StaffControllers.deleteHoliday);

export const StaffRoutes = router;
