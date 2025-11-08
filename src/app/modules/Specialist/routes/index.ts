import { AppointmentsRoutes } from "../modules/appointments/appointments.route";
import { CustomersRoutes } from "../modules/customers/customers.route";

const moduleRoutes = [
    {
        path: "/appointments",
        handlers: [AppointmentsRoutes],
    },
    {
        path: "/customers",
        handlers: [CustomersRoutes],
    },
] satisfies {
    path: string;
    handlers: unknown[];
}[];

export default moduleRoutes;
