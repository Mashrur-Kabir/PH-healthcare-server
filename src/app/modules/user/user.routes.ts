import { Router } from "express";
import { userController } from "./user.controller";
import validateRequest from "../../middlewares/validateRequest";
import { userValidation } from "./user.validation";
import checkAuth from "../../middlewares/authMiddleware";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

//ONLY USER CREATION WILL TAKE PLACE HERE

router.post(
  "/create-doctor",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(userValidation.createDoctorSchema),
  userController.createDoctor,
);
router.post(
  "/create-admin",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  userController.createDoctor,
);
router.post(
  "/create-superadmin",
  checkAuth(Role.SUPER_ADMIN),
  userController.createDoctor,
);

export const UserRoutes = router;
