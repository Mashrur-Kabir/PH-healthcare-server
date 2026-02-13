import status from "http-status";
import { AppError } from "../../error/AppError";
import { catchAsync } from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { Request, Response } from "express";
import { userService } from "./user.service";

const createDoctor = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  if (!payload) {
    throw new AppError(status.BAD_REQUEST, "Request body/payload missing!");
  }

  const result = await userService.createDoctorInDB(payload);

  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Doctor created successfully!",
    data: result,
  });
});

const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.createAdminInDB(req.body);

  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Admin created successfully!",
    data: result,
  });
});

const createSuperAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.createSuperAdminInDB(req.body);

  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Super Admin created successfully!",
    data: result,
  });
});

export const userController = {
  createDoctor,
  createAdmin,
  createSuperAdmin,
};
