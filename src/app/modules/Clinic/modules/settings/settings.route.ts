import { Router } from "express";
import SettingsControllers from "./settings.controller";
import validateRequest from "../../../../middlewares/validateRequest";
import clinicValidation from "../../clinic.validation";

const router = Router();

// Get Basic Info
router.get("/basic", SettingsControllers.getBasicInfo);

// Update Basic Info
router.patch(
    "/basic",
    validateRequest(clinicValidation.updateClinicInfoSchema),
    SettingsControllers.updateClinicInfo
);

// Get Branding Info
router.get("/branding", SettingsControllers.getBrandingInfo);

// Update Branding Info
router.patch(
    "/branding",
    validateRequest(clinicValidation.updateBrandingInfoSchema),
    SettingsControllers.updateBrandingInfo
);

export const SettingsRoutes = router;
