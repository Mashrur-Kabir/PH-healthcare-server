import { Request, Response } from "express";
import { AppError } from "../../error/AppError";
import { catchAsync } from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { AuthService } from "./auth.service";
import status from "http-status";
import { tokenUtils } from "../../utils/token";
import { CookieUtils } from "../../utils/cookie";
import { envVars } from "../../../config/env";
import { auth } from "../../lib/auth";

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

const getNewToken = catchAsync(async (req: Request, res: Response) => {
  //Extract the current Refresh Token and Session Token from req.cookies
  const refreshToken = req.cookies.refreshToken;
  const sessionToken = req.cookies["better-auth.session_token"];

  if (!refreshToken || !sessionToken) {
    throw new AppError(status.UNAUTHORIZED, "Required tokens are missing!");
  }

  //Call the service to rotate tokens
  const result = await AuthService.getNewTokenService(
    refreshToken,
    sessionToken,
  );

  const {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    sessionToken: newSessionToken,
  } = result;

  //Set the fresh tokens in cookies
  tokenUtils.setAccessTokenCookie(res, newAccessToken);
  tokenUtils.setRefreshTokenCookie(res, newRefreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, newSessionToken);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Access token regenerated successfully!",
    data: {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      sessionToken: newSessionToken,
    },
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const sessionTokenFromCookie = req.cookies["better-auth.session_token"];

  const result = await AuthService.changePasswordInDB(
    payload,
    sessionTokenFromCookie,
  );

  const { accessToken, refreshToken, token } = result;

  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token as string); // We know it shouldn't be null, but we must handle it

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Password changed successfully!",
    data: result,
  });
});

const logoutUser = catchAsync(async (req: Request, res: Response) => {
  // 1. Extract the session token from cookies
  const sessionToken = req.cookies["better-auth.session_token"];

  // 2. Invalidate session in DB
  const result = await AuthService.logoutUserInDB(sessionToken);

  // 3. Clear all Auth-related cookies
  // Note: Path must match what was used in tokenUtils (default is "/")
  const cookieOptions = {
    path: "/",
    httpOnly: true,
    secure: envVars.NODE_ENV === "production",
    sameSite: "none" as const,
  };

  CookieUtils.clearCookie(res, "accessToken", cookieOptions);
  CookieUtils.clearCookie(res, "refreshToken", cookieOptions);
  CookieUtils.clearCookie(res, "better-auth.session_token", cookieOptions);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Logged out successfully!",
    data: result,
  });
});

const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new AppError(status.BAD_REQUEST, "Email and OTP are required!");
  }

  // Call the service to verify the OTP via Better-Auth
  await AuthService.verifyEmailForUser(email, otp);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Email verified successfully! You can now log in.",
    data: null,
  });
});

const forgetPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;

  await AuthService.forgetPasswordForUser(email);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Password reset code sent to your email!",
    data: null,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;

  // 1. Service handles OTP verification, DB update, and session deletion
  await AuthService.resetPasswordForUser(email, otp, newPassword);

  // 2. Clear all Auth-related cookies from the browser
  const cookieOptions = {
    path: "/",
    httpOnly: true,
    secure: envVars.NODE_ENV === "production",
    sameSite: "none" as const,
  };

  CookieUtils.clearCookie(res, "accessToken", cookieOptions);
  CookieUtils.clearCookie(res, "refreshToken", cookieOptions);
  CookieUtils.clearCookie(res, "better-auth.session_token", cookieOptions);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message:
      "Password reset successful! Please login with your new credentials.",
    data: null,
  });
});

const loginWithGoogle = catchAsync(async (req: Request, res: Response) => {
  const redirectPath = req.query.redirect || "/dashboard";
  const encodedRedirectPath = encodeURIComponent(redirectPath as string);

  const callbackURL = `${envVars.BETTER_AUTH_URL}/api/v1/auth/google/success?redirect=${encodedRedirectPath}`;

  res.render("googleRedirect", {
    callbackURL: callbackURL,
    betterAuthUrl: envVars.BETTER_AUTH_URL,
  });
});

const googleLoginSuccess = catchAsync(async (req: Request, res: Response) => {
  const redirectPath = (req.query.redirect as string) || "/dashboard";
  const sessionToken = req.cookies["better-auth.session_token"];

  if (!sessionToken) {
    return res.redirect(`${envVars.FRONTEND_URL}/login?error=oauth_failed`);
  }

  const session = await auth.api.getSession({
    headers: new Headers({
      Cookie: `better-auth.session_token=${sessionToken}`,
    }),
  });

  if (!session || !session.user) {
    return res.redirect(`${envVars.FRONTEND_URL}/login?error=no_user_found`);
  }

  // Pass the whole session to the service to handle Profile creation
  const result = await AuthService.googleLoginSuccessForUser(session);
  const { accessToken, refreshToken } = result;

  // Set cookies for your JWT system
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);

  const isValidRedirectPath =
    redirectPath.startsWith("/") && !redirectPath.startsWith("//");
  const finalRedirectPath = isValidRedirectPath ? redirectPath : "/dashboard";

  // Instead of a raw redirect, render your EJS to "talk" to the frontend
  res.render("googleSuccess", {
    accessToken,
    refreshToken,
    sessionToken,
    user: session.user,
    frontendUrl: envVars.FRONTEND_URL,
    redirectPath: finalRedirectPath,
  });
});

const handleOauthError = catchAsync(async (req: Request, res: Response) => {
  const error = (req.query.error as string) || "oauth_failed";

  res.redirect(`${envVars.FRONTEND_URL}/login?error=${error}`);
});

export const AuthController = {
  registerPatient,
  loginPatient,
  getMe,
  getNewToken,
  changePassword,
  logoutUser,
  verifyEmail,
  forgetPassword,
  resetPassword,
  loginWithGoogle,
  googleLoginSuccess,
  handleOauthError,
};
