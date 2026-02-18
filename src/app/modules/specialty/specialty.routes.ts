import { Router } from "express";
import { specialtyController } from "./specialty.controller";
import checkAuth from "../../middlewares/authMiddleware";
import { Role } from "../../../generated/prisma/enums";
import { multerUpload } from "../../../config/multer.config";
import validateRequest from "../../middlewares/validateRequest";
import { SpecialtyValidation } from "./specialty.validation";

const router = Router();

router.post(
  "/",
  // checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  multerUpload.single("file"),
  validateRequest(SpecialtyValidation.createSpecialtyZodSchema),
  specialtyController.createSpecialty,
);
router.get("/", specialtyController.getAllSpecialty);
router.get("/:specialtyId", specialtyController.getSingleSpecialty);
router.delete(
  "/:specialtyId",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  specialtyController.deleteSpecialty,
);
router.patch(
  "/:specialtyId",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  specialtyController.updateSpecialty,
);

export const SpecialtyRoutes = router;
