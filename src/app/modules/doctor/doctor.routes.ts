import { Router } from "express";
import { doctorController } from "./doctor.controller";
import validateRequest from "../../middlewares/validateRequest";
import { doctorValidation } from "./doctor.validation";
import checkAuth from "../../middlewares/authMiddleware";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.get("/", doctorController.getAllDoctors);
router.get("/:id", doctorController.getDoctorById);
router.patch(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.DOCTOR),
  validateRequest(doctorValidation.updateDoctorSchema),
  doctorController.updateDoctor,
);
router.delete(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.DOCTOR),
  doctorController.softDeleteDoctor,
);

export const DoctorRoutes = router;
