import express from "express";
import auth from "../../middlewares/auth";
import AuthController from "./auth.controller";

const router = express.Router();

// Login User
router.post("/login", AuthController.loginUser);

// Logout User
router.post("/logout", auth(), AuthController.logoutUser);

// Get Current User Info - This should not be here
// router.get("/me", auth(), AuthController.getUserInfo);

// Change Password
router.put("/change-password", auth(), AuthController.changePassword);

// Forgot Password
router.post("/forgot-password", AuthController.forgotPassword);

// Refresh Token
router.post("/refresh-token", AuthController.refreshToken);

export const AuthRoutes = router;
