import { Router } from "express";
import PaymentsControllers from "./payments.controller";
import auth from "../../../../middlewares/auth";
import PaymentsValidations from "./payments.validation";

const router = Router();


export const PaymentsRoutes = router;