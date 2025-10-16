import { DisciplineRoutes } from "../modules/disciplines/disciplines.route";
import { ServiceRoutes } from "../modules/services/services.route";
import { StaffRoutes } from "../modules/staff/staff.route";
import { PatientRoutes } from "../modules/patients/patients.route";
import { AppointmentRoutes } from "../modules/appointments/appointments.route";
import { ReceiptRoutes } from "../modules/receipts/receipts.route";
import { ReminderRoutes } from "../modules/reminder/reminder.route";
import { SettingsRoutes } from "../modules/settings/settings.route";
import { ReportsRoutes } from "../modules/reports/reports.route";
import auth from "../../../middlewares/auth";

const moduleRoutes = [
    {
        path: "/disciplines",
        handlers: [DisciplineRoutes],
    },
    {
        path: "/services",
        handlers: [ServiceRoutes],
    },
    {
        path: "/staff",
        handlers: [StaffRoutes],
    },
    {
        path: "/patients",
        handlers: [PatientRoutes],
    },
    {
        path: "/appointments",
        handlers: [AppointmentRoutes],
    },
    {
        path: "/receipts",
        handlers: [ReceiptRoutes],
    },
    {
        path: "/reminder",
        handlers: [ReminderRoutes],
    },
    {
        path: "/settings",
        handlers: [SettingsRoutes],
    },
    {
        path: "/reports",
        handlers: [auth("CLINIC_ADMIN"), ReportsRoutes],
    },
] satisfies {
    path: string;
    handlers: any[];
}[];

export default moduleRoutes;
