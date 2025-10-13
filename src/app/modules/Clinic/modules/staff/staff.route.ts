import { Router } from "express";
import StaffControllers from "./staff.controller";
import validateRequest from "../../../../middlewares/validateRequest";
import clinicValidation from "../../clinic.validation";

const router = Router();

// Create New Staff
router.post(
    "/",
    validateRequest(clinicValidation.createStaffSchema),
    StaffControllers.createNewStaff
);

// Get All Staff
router.get("/", StaffControllers.getAllStaff);

// get By Id, update, delete
router.get("/:id", StaffControllers.getStaffById);

// Update Staff data
router.patch(
    "/:id",
    validateRequest(clinicValidation.updateStaffSchema),
    StaffControllers.updateStaffData
);

// Delete Staff data
router.delete("/:id", StaffControllers.deleteStaffData);

export const StaffRoutes = router;
