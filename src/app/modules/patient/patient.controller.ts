import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { PatientService } from "./patient.service";
import sendResponse from "../../shared/sendResponse";
import { IAuthUser } from "../../interfaces";

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IAuthUser;
  const payload = req.body;

  const result = await PatientService.updateMyProfileInDB(user, payload);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});

export const PatientController = {
  updateMyProfile,
};
