import { Router } from "express";
import CustomersControllers from "./customers.controller";

const router = Router();

// Get New Customers Count
router.get("/count", CustomersControllers.getNewCustomersCount);

export const CustomersRoutes = router;
