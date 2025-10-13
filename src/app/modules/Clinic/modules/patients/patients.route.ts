import { Router } from "express";
import PatientControllers from "./patients.controller";
import validateRequest from "../../../../middlewares/validateRequest";
import clinicValidation from "../../clinic.validation";
import { fileUploader } from "../../../../../helpers/fileUploader";
import { parseBodyData } from "../../../../middlewares/parseBodyData";

const router = Router();

// Get new Patients Count
router.get("/patients/count", PatientControllers.getNewPatientsCount);

// Create new Patient
router.post(
    "/",
    fileUploader.upload.fields([
        {
            name: "guardianDocuments",
        },
        {
            name: "documents",
        },
        {
            name: "otherDocuments",
        },
    ]),
    parseBodyData,
    validateRequest(clinicValidation.createPatientSchema),
    PatientControllers.createPatient
);

// Get Patients
router.get("/", PatientControllers.getPatients);

// Get Patient by Id
router.get("/:id", PatientControllers.getPatientById);

// Get Patient Appointments
router.get("/:id/appointments", PatientControllers.getPatientAppointments);

// Get Patient Bonds
router.get("/:id/bonds", PatientControllers.getPatientBonds);

export const PatientRoutes = router;
