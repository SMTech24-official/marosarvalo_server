import { Router } from "express";
import ClinicControllers from "./clinic.controller";

const router = Router();

//==============================================
//         Doctor Routes ".../doctors"
//=============================================

// Get Doctors Count
router.get("/doctors/count", ClinicControllers.getDoctorsCount);

//==============================================
//    Appointment Routes ".../appointments"
//=============================================

// Get Appointments Count
router.get("/appointments/count", ClinicControllers.getAppointmentsCount);

// Get Appointments Overview
router.get("/appointments/overview", ClinicControllers.getAppointmentsOverview);

// Get Appointments Calendar
router.get("/appointments/calendar", ClinicControllers.getAppointmentsCalender);

// Get Appointments
router.get("/appointments", ClinicControllers.getAppointments);

//==============================================
//     Customer Routes ".../customers"
//=============================================

// Get New Customers Count
router.get("/customers/count", ClinicControllers.getNewCustomersCount);

//==============================================
//      Service Routes ".../services"
//=============================================

// Get Services Overview
router.get("/services/overview");

export const SpecialistRoutes = router;
