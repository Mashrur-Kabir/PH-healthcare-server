import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { DoctorScheduleController } from "./doctorSchedule.controller";
import checkAuth from "../../middlewares/authMiddleware";
import validateRequest from "../../middlewares/validateRequest";
import { DoctorScheduleValidation } from "./doctorSchedule.validation";

const router = Router();

router.post(
  "/create-my-doctor-schedule",
  checkAuth(Role.DOCTOR),
  validateRequest(DoctorScheduleValidation.createMyDoctorSchedule),
  DoctorScheduleController.createMyDoctorSchedule,
);
router.get(
  "/my-doctor-schedules",
  checkAuth(Role.DOCTOR),
  DoctorScheduleController.getMyDoctorSchedules,
);
router.get(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  DoctorScheduleController.getAllDoctorSchedules,
);
router.get(
  "/:doctorId/schedule/:scheduleId",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  DoctorScheduleController.getDoctorScheduleById,
);
router.patch(
  "/update-my-doctor-schedule",
  checkAuth(Role.DOCTOR),
  validateRequest(DoctorScheduleValidation.updateMyDoctorSchedule),
  DoctorScheduleController.updateMyDoctorSchedule,
);
router.delete(
  "/delete-my-doctor-schedule/:id",
  checkAuth(Role.DOCTOR),
  DoctorScheduleController.deleteMyDoctorSchedule,
);

export const DoctorScheduleRoutes = router;
