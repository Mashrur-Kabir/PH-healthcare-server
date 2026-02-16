import { Router } from "express";
import { AuthController } from "./auth.controller";
import { Role } from "../../../generated/prisma/enums";
import checkAuth from "../../middlewares/authMiddleware";
import validateRequest from "../../middlewares/validateRequest"; // Import middleware
import { AuthValidation } from "./auth.validation";

const router = Router();

// Public Routes with Validation
router.post(
  "/register",
  validateRequest(AuthValidation.registerPatientValidationSchema),
  AuthController.registerPatient,
);

router.post(
  "/login",
  validateRequest(AuthValidation.loginPatientValidationSchema),
  AuthController.loginPatient,
);

router.post(
  "/verify-email",
  validateRequest(AuthValidation.verifyEmailValidationSchema),
  AuthController.verifyEmail,
);

// Request OTP for password reset
router.post(
  "/forget-password",
  validateRequest(AuthValidation.forgetPasswordValidationSchema),
  AuthController.forgetPassword,
);

// Verify OTP and set new password
router.post(
  "/reset-password",
  validateRequest(AuthValidation.resetPasswordValidationSchema),
  AuthController.resetPassword,
);

// Protected Routes
router.get(
  "/me",
  checkAuth(Role.PATIENT, Role.DOCTOR, Role.ADMIN, Role.SUPER_ADMIN),
  AuthController.getMe,
);

router.post(
  "/refresh-token",
  checkAuth(Role.PATIENT, Role.DOCTOR, Role.ADMIN, Role.SUPER_ADMIN),
  AuthController.getNewToken,
);

router.post(
  "/change-password",
  checkAuth(Role.PATIENT, Role.DOCTOR, Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(AuthValidation.changePasswordValidationSchema), // Added validation
  AuthController.changePassword,
);

router.post(
  "/logout",
  checkAuth(Role.PATIENT, Role.DOCTOR, Role.ADMIN, Role.SUPER_ADMIN),
  AuthController.logoutUser,
);

router.get("/login/google", AuthController.loginWithGoogle);
router.get("/google/success", AuthController.googleLoginSuccess);
router.get("/oauth/error", AuthController.handleOauthError);

export const AuthRoutes = router;
