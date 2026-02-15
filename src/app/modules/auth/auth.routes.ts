import { Router } from "express";
import { AuthController } from "./auth.controller";
import { Role } from "../../../generated/prisma/enums";
import checkAuth from "../../middlewares/authMiddleware";

const router = Router();

router.post("/register", AuthController.registerPatient);
router.post("/login", AuthController.loginPatient);

router.get(
  "/me",
  checkAuth(Role.PATIENT, Role.DOCTOR, Role.ADMIN, Role.SUPER_ADMIN),
  AuthController.getMe,
);

export const AuthRoutes = router;
