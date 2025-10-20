import { Router } from "express";
import AppointmentsControllers from "./appointments.controller";

const router = Router();

// Get Appointments Count
router.get("/count", AppointmentsControllers.getAppointmentsCount);

// Get Appointments Overview
router.get("/overview", AppointmentsControllers.getAppointmentsOverview);

// Get Upcoming Appointments
router.get("/upcoming", AppointmentsControllers.getUpcomingAppointments);

// Get Appointments Calendar
router.get("/calendar", AppointmentsControllers.getAppointmentsCalender);

// Set Appointment Completed
router.patch("/:id/complete", AppointmentsControllers.setAppointmentCompleted);

export const AppointmentsRoutes = router;
