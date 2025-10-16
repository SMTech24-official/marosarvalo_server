import { Router } from "express";
import AppointmentControllers from "./appointments.controller";
import validateRequest from "../../../../middlewares/validateRequest";
import appointmentValidations from "./appointments.validation";
import { fileUploader } from "../../../../../helpers/fileUploader";
import { parseBodyData } from "../../../../middlewares/parseBodyData";

const router = Router();

// Create new Appointment
router.post(
    "/",
    fileUploader.upload.fields([
        {
            name: "documents",
        },
    ]),
    parseBodyData,
    validateRequest(appointmentValidations.createAppointmentSchema),
    AppointmentControllers.createAppointment
);

// Get Appointments
router.get("/", AppointmentControllers.getAppointments);

// Get Appointment by Id
router.get("/:id", AppointmentControllers.getAppointmentById);

// Delete Appointment
router.delete("/:id", AppointmentControllers.deleteAppointment);

// Change Appointment Status
router.patch("/:id/:status", AppointmentControllers.changeAppointmentStatus);

// Get Appointments Count
router.get("/count", AppointmentControllers.getAppointmentsCount);

// Get Appointments Overview
router.get("/overview", AppointmentControllers.getAppointmentsOverview);

// Get Appointments Calendar
router.get("/calendar", AppointmentControllers.getAppointmentsCalender);

export const AppointmentRoutes = router;
