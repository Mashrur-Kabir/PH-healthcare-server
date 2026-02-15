import { Request, Response } from "express";
import { AppError } from "../../error/AppError";
import { catchAsync } from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { AuthService } from "./auth.service";
import status from "http-status";
import { tokenUtils } from "../../utils/token";

const registerPatient = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  if (!payload) {
    throw new AppError(status.BAD_REQUEST, "Request body/payload missing!");
  }

  const result = await AuthService.registerPatientInDB(payload);
  const { accessToken, refreshToken, token, ...rest } = result;
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token as string);

  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Registration successful!",
    data: {
      token,
      accessToken,
      refreshToken,
      ...rest,
    },
  });
});

const loginPatient = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  if (!payload) {
    throw new AppError(status.BAD_REQUEST, "Request body/payload missing!");
  }

  const result = await AuthService.loginPatientInDB(payload);
  const { accessToken, refreshToken, token, ...rest } = result;

  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Login successful!",
    data: {
      token,
      accessToken,
      refreshToken,
      ...rest,
    },
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    throw new AppError(status.UNAUTHORIZED, "Unauthorized user!");
  }
  const result = await AuthService.getMeFromDB(user);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Your user details retrieved successfully!",
    data: result,
  });
});

export const AuthController = {
  registerPatient,
  loginPatient,
  getMe,
};
