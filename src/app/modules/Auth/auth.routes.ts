import express from "express";
import auth from "../../middlewares/auth";
import AuthController from "./auth.controller";
import authValidations from "./auth.validation";
import validateRequest from "../../middlewares/validateRequest";

const router = express.Router();

// Login User
router.post(
    "/login",
    validateRequest(authValidations.loginSchema),
    AuthController.loginUser,
);

// Logout User
router.post("/logout", auth(), AuthController.logoutUser);

// Get Current User Info - This should not be here
// router.get("/me", auth(), AuthController.getUserInfo);

// Change Password
router.patch(
    "/change-password",
    auth(),
    validateRequest(authValidations.changePasswordSchema),
    AuthController.changePassword,
);

// Forgot Password
router.post(
    "/forgot-password",
    validateRequest(authValidations.forgotPasswordSchema),
    AuthController.forgotPassword,
);

// Refresh Token
router.post(
    "/refresh-token",
    validateRequest(authValidations.refreshTokenSchema),
    AuthController.refreshToken,
);

export const AuthRoutes = router;
