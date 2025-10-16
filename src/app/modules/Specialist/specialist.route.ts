import { Router } from "express";
import SpecialistControllers from "./specialist.controller";

const router = Router();

// Get Appointments Count
router.get("/appointments/count", SpecialistControllers.getAppointmentsCount);

// Get Doctors Count
router.get("/doctors/count", SpecialistControllers.getDoctorsCount);

// Get New Customers Count
router.get("/customers/count", SpecialistControllers.getNewCustomersCount);

// Get Appointments Overview
router.get(
    "/appointments/overview",
    SpecialistControllers.getAppointmentsOverview,
);

// Get Upcoming Appointments
router.get(
    "/appointments/upcoming",
    SpecialistControllers.getUpcomingAppointments,
);

// Get Appointments Calendar
router.get(
    "/appointments/calendar",
    SpecialistControllers.getAppointmentsCalender,
);

export const SpecialistRoutes = router;
