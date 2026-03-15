import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { AdminService } from "./admin.service";

const getAllAdmins = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAllAdminsFromDB();
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Admins fetched successfully",
    data: result,
  });
});

const getAdminById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await AdminService.getAdminByIdFromDB(id as string);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Admin fetched successfully",
    data: result,
  });
});

const updateAdmin = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await AdminService.updateAdminInDB(id as string, req.body);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Admin updated successfully",
    data: result,
  });
});

const softDeleteAdmin = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await AdminService.softDeleteAdminFromDB(
    id as string,
    req.user,
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Admin deleted successfully",
    data: result,
  });
});

const changeUserStatus = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const payload = req.body;
  const result = await AdminService.changeUserStatusInDB(user, payload);
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "User status changed successfully",
    data: result,
  });
});

const changeUserRole = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const payload = req.body;
  const result = await AdminService.changeUserRoleInDB(user, payload);
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "User role changed successfully",
    data: result,
  });
});

export const adminController = {
  getAllAdmins,
  getAdminById,
  updateAdmin,
  softDeleteAdmin,
  changeUserStatus,
  changeUserRole,
};
