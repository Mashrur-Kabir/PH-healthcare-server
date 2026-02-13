import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import checkAuth from "../../middlewares/authMiddleware";
import validateRequest from "../../middlewares/validateRequest";
import { superAdminController } from "./superAdmin.controller";
import { superAdminValidation } from "./superAdmin.validation";

const router = Router();

router.get(
  "/",
  checkAuth(Role.SUPER_ADMIN),
  superAdminController.getAllSuperAdmins,
);

router.get(
  "/:id",
  checkAuth(Role.SUPER_ADMIN),
  superAdminController.getSuperAdminById,
);

router.patch(
  "/:id",
  checkAuth(Role.SUPER_ADMIN),
  validateRequest(superAdminValidation.updateSuperAdminSchema),
  superAdminController.updateSuperAdmin,
);

router.delete(
  "/:id",
  checkAuth(Role.SUPER_ADMIN),
  superAdminController.softDeleteSuperAdmin,
);

export const SuperAdminRoutes = router;
