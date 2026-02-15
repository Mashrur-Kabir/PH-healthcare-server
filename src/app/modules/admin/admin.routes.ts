import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import checkAuth from "../../middlewares/authMiddleware";
import validateRequest from "../../middlewares/validateRequest";
import { adminController } from "./admin.controller";
import { adminValidation } from "./admin.validation";

const router = Router();

router.get(
  "/",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  adminController.getAllAdmins,
);

router.get(
  "/:id",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  adminController.getAdminById,
);

router.patch(
  "/:id",
  checkAuth(Role.SUPER_ADMIN),
  validateRequest(adminValidation.updateAdminSchema),
  adminController.updateAdmin,
);

router.delete(
  "/:id",
  checkAuth(Role.SUPER_ADMIN),
  adminController.softDeleteAdmin,
);

export const AdminRoutes = router;
