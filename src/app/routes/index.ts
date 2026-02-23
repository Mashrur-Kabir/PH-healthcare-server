import { Router } from "express";
import { SpecialtyRoutes } from "../modules/specialty/specialty.routes";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { UserRoutes } from "../modules/user/user.routes";
import { DoctorRoutes } from "../modules/doctor/doctor.routes";
import { AdminRoutes } from "../modules/admin/admin.routes";
import { SuperAdminRoutes } from "../modules/superAdmin/superAdmin.routes";
import { ScheduleRoutes } from "../modules/schedule/schedule.routes";
import { DoctorScheduleRoutes } from "./../modules/doctorSchedule/doctorSchedule.route";
import { AppointmentRoutes } from "../modules/appointment/appointment.route";
import { PatientRoutes } from "../modules/patient/patient.route";
import { ReviewRoutes } from "../modules/review/review.route";
import { PrescriptionRoutes } from "../modules/prescriptions/prescription.route";

const router = Router();

//auth entry:
router.use("/auth", AuthRoutes);

//specialty entry:
router.use("/specialties", SpecialtyRoutes);

//user entry:
router.use("/users", UserRoutes);

//doctor apis
router.use("/doctors", DoctorRoutes);

//patient apis
router.use("/patients", PatientRoutes);

//admin apis
router.use("/admins", AdminRoutes);

//super admin apis
router.use("/super-admins", SuperAdminRoutes);

//schedule
router.use("/schedules", ScheduleRoutes);

//doctor-schedules
router.use("/doctor-schedules", DoctorScheduleRoutes);

//appointments
router.use("/appointments", AppointmentRoutes);

//review
router.use("/reviews", ReviewRoutes);

//prescriptions
router.use("/prescriptions", PrescriptionRoutes);

export const IndexRoutes = router;
