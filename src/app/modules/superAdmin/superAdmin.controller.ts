import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { superAdminService } from "./superAdmin.service";

const getAllSuperAdmins = catchAsync(async (req: Request, res: Response) => {
  const result = await superAdminService.getAllSuperAdminsFromDB();
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Super Admins fetched successfully",
    data: result,
  });
});

const getSuperAdminById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await superAdminService.getSuperAdminByIdFromDB(id as string);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Super Admin fetched successfully",
    data: result,
  });
});

const updateSuperAdmin = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await superAdminService.updateSuperAdminInDB(
    id as string,
    req.body,
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Super Admin updated successfully",
    data: result,
  });
});

const softDeleteSuperAdmin = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await superAdminService.softDeleteSuperAdminFromDB(
    id as string,
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Super Admin deleted successfully",
    data: result,
  });
});

export const superAdminController = {
  getAllSuperAdmins,
  getSuperAdminById,
  updateSuperAdmin,
  softDeleteSuperAdmin,
};
