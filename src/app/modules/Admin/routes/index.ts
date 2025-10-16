import { ClinicRoutes } from "../../Clinic/clinic.route";
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
] satisfies {
    path: string;
    handlers: any[];
}[];

export default moduleRoutes;
