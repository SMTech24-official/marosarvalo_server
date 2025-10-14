import { Router } from "express";
import StaffControllers from "./staff.controller";
import validateRequest from "../../../../middlewares/validateRequest";
import staffValidations from "./staff.validation";

const router = Router();

// Create New Staff
router.post(
    "/",
    validateRequest(staffValidations.createStaffSchema),
    StaffControllers.createNewStaff
);

// Get All Staff
router.get("/", StaffControllers.getAllStaff);

// get By Id, update, delete
router.get("/:id", StaffControllers.getStaffById);

// Update Staff data
router.patch(
    "/:id",
    validateRequest(staffValidations.updateStaffSchema),
    StaffControllers.updateStaffData
);

// Delete Staff data
router.delete("/:id", StaffControllers.deleteStaffData);

// Get Staff Schedules
router.get("/schedules", StaffControllers.getStaffSchedules);

export const StaffRoutes = router;
