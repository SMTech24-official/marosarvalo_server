import { ClinicRoutes } from "../../Clinic/clinic.route";
import { PackageRoutes } from "../modules/package/package.route";

const moduleRoutes = [
    {
        path: "/clinic",
        handlers: [ClinicRoutes],
    },
    {
        path: "/packages",
        handlers: [PackageRoutes],
    },
] satisfies {
    path: string;
    handlers: any[];
}[];

export default moduleRoutes;
