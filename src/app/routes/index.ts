import { Router } from "express";
import { SpecialtyRoutes } from "../modules/specialty/specialty.routes";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { UserRoutes } from "../modules/user/user.routes";
import { DoctorRoutes } from "../modules/doctor/doctor.routes";

const router = Router();

//auth entry:
router.use("/auth", AuthRoutes);

//specialty entry:
router.use("/specialties", SpecialtyRoutes);

//user entry:
router.use("/users", UserRoutes);

//doctor apis
router.use("/doctors", DoctorRoutes);

export const IndexRoutes = router;
