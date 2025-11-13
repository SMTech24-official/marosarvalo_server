import express from "express";
import PackageControllers from "./package.controller";
import packageValidation from "./package.validation";
import validateRequest from "../../../../middlewares/validateRequest";

const router = express.Router();

// Create Package
router.post(
    "/",
    validateRequest(packageValidation.createPackageSchema),
    PackageControllers.createPackage,
);

// Get All Packages
router.get("/", PackageControllers.getAllPackages);

// Get Single Package
router.get("/:id", PackageControllers.getSinglePackage);

// Update Package
router.patch(
    "/:id",
    validateRequest(packageValidation.updatePackageSchema),
    PackageControllers.updatePackage,
);

// Delete Package
router.delete("/:id", PackageControllers.deletePackage);

// Update Package Status
router.patch("/:id/status", PackageControllers.updatePackageStatus);

export const PackageRoutes = router;
