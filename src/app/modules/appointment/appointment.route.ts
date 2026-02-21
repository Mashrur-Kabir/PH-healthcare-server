import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { AppointmentController } from "./appointment.controller";
import checkAuth from "../../middlewares/authMiddleware";
import validateRequest from "../../middlewares/validateRequest";
import { AppointmentValidation } from "./appointment.validation";

const router = Router();

router.post(
  "/book-appointment",
  checkAuth(Role.PATIENT),
  validateRequest(AppointmentValidation.bookAppointment),
  AppointmentController.bookAppointment,
);
router.get(
  "/my-appointments",
  checkAuth(Role.PATIENT, Role.DOCTOR),
  AppointmentController.getMyAppointments,
);
router.patch(
  "/change-appointment-status/:id",
  checkAuth(Role.PATIENT, Role.DOCTOR, Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(AppointmentValidation.changeAppointmentStatus),
  AppointmentController.changeAppointmentStatus,
);
router.get(
  "/my-single-appointment/:id",
  checkAuth(Role.PATIENT, Role.DOCTOR),
  AppointmentController.getMySingleAppointment,
);
router.get(
  "/all-appointments",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  AppointmentController.getAllAppointments,
);
router.post(
  "/book-appointment-with-pay-later",
  checkAuth(Role.PATIENT),
  validateRequest(AppointmentValidation.bookAppointment),
  AppointmentController.bookAppointmentWithPayLater,
);
router.post(
  "/initiate-payment/:id",
  checkAuth(Role.PATIENT),
  AppointmentController.initiatePayment,
);

export const AppointmentRoutes = router;
