import { Router } from "express";
import UserController from "./me.controller";

const router = Router();

// Get Current User Information
router.get("/", UserController.getUserInfo);

// Update Current User Info
router.put("/", UserController.updateUserInfo);

export const MeRoutes = router;
