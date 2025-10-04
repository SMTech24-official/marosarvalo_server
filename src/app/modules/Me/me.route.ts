import { Router } from "express";
import UserController from "./me.controller";
import auth from "../../middlewares/auth";

const router = Router();

// Get Current User Information
router.get("/", auth(), UserController.getUserInfo);

// Update Current User Info
router.put(
    "/",
    auth("SUPER_ADMIN", "RECEPTIONIST"),
    UserController.updateUserInfo
);

export const MeRoutes = router;
