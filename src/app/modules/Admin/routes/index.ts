import { BookingsRoutes } from "../modules/bookings/bookings.route";
import { ClinicRoutes } from "../modules/clinic/clinic.route";
import { PackageRoutes } from "../modules/package/package.route";
import { ReminderRoutes } from "../modules/reminder/reminder.route";

const moduleRoutes = [
    {
        path: "/clinic",
        handlers: [ClinicRoutes],
    },
    {
        path: "/packages",
        handlers: [PackageRoutes],
    },
    {
        path: "/reminder",
        handlers: [ReminderRoutes],
    },
    {
        path: "/bookings",
        handlers: [BookingsRoutes],
    },
] satisfies {
    path: string;
    handlers: unknown[];
}[];

export default moduleRoutes;
