import { Router } from "express";
import ClinicControllers from "./clinic.controller";
import validateRequest from "../../middlewares/validateRequest";
import clinicValidation from "./clinic.validation";
import { fileUploader } from "../../../helpers/fileUploader";
import { parseBodyData } from "../../middlewares/parseBodyData";

const router = Router();

//==============================================
//         Doctor Routes ".../doctors"
//=============================================

// Get Doctors Count
router.get("/doctors/count", ClinicControllers.getDoctorsCount);

//==============================================
//    Appointment Routes ".../appointments"
//=============================================

router.post(
    "/appointments",
    fileUploader.upload.fields([
        {
            name: "documents",
        },
    ]),
    parseBodyData,
    validateRequest(clinicValidation.createAppointmentSchema),
    ClinicControllers.createAppointment
);

// Get Appointments Count
router.get("/appointments/count", ClinicControllers.getAppointmentsCount);

// Get Appointments Overview
router.get("/appointments/overview", ClinicControllers.getAppointmentsOverview);

// Get Appointments Calendar
router.get("/appointments/calendar", ClinicControllers.getAppointmentsCalender);

// Get Appointments
router.get("/appointments", ClinicControllers.getAppointments);

//==============================================
//     Patient Routes ".../customers"
//=============================================

// Get new Patients Count
router.get("/patients/count", ClinicControllers.getNewPatientsCount);

// Create new Patient
router.post(
    "/patients",
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
    ClinicControllers.createPatient
);

// Get Patients
router.get("/patients", ClinicControllers.getPatients);

// Get Patient by Id
router.get("/patients/:id", ClinicControllers.getPatientById);

// Get Patient Appointments
router.get(
    "/patients/:id/appointments",
    ClinicControllers.getPatientAppointments
);

// Get Patient Bonds
router.get("/patients/:id/bonds", ClinicControllers.getPatientBonds);

//==============================================
//      Receipt Routes ".../receipts"
//=============================================

// Create Receipt
router.post(
    "/receipts",
    validateRequest(clinicValidation.createReceiptSchema),
    ClinicControllers.createReceipt
);

// Get Receipts
router.get("/receipts", ClinicControllers.getReceipts);

// Get Receipt Details by Id
router.get("/receipts/:id", ClinicControllers.getReceiptDetailsById);

// Delete Receipt
router.delete("/receipts/:id", ClinicControllers.deleteReceipt);

//==============================================
//      Service Routes ".../services"
//=============================================

// Get Services Statistics
router.get("/services/statistics", ClinicControllers.getServicesStatistics);

export const ClinicRoutes = router;
