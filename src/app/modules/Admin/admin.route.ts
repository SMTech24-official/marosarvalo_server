import { Router } from "express";
import AdminControllers from "./admin.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { parseBodyData } from "../../middlewares/parseBodyData";
import validateRequest from "../../middlewares/validateRequest";
import AdminValidations from "./admin.validation";

const router = Router();

// Create new Admin
router.post(
  "/administrators",
  auth("SUPER_ADMIN"),
  AdminControllers.createNewAdmin
);

export const AdminRoutes = router;
