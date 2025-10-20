import { AppointmentsRoutes } from "../modules/appointments/appointments.route";
import { CustomersRoutes } from "../modules/customers/customers.route";
import auth from "../../../middlewares/auth";

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
    handlers: any[];
}[];

export default moduleRoutes;
