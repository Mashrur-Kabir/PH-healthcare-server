import { Response } from "express";
import { JwtPayload, SignOptions } from "jsonwebtoken";
import { jwtHelpers } from "./jwt"; // Updated import name
import { envVars } from "../../config/env";
import { CookieUtils } from "./cookie";

// 1. Creating access token
const getAccessToken = (payload: JwtPayload): string => {
  return jwtHelpers.createToken(
    payload,
    envVars.ACCESS_TOKEN_SECRET as string,
    { expiresIn: envVars.ACCESS_TOKEN_EXPIRES_IN } as SignOptions,
  );
};

// 2. Creating refresh token
const getRefreshToken = (payload: JwtPayload): string => {
  return jwtHelpers.createToken(
    payload,
    envVars.REFRESH_TOKEN_SECRET as string,
    { expiresIn: envVars.REFRESH_TOKEN_EXPIRES_IN } as SignOptions,
  );
};

/**
 * COOKIE MANAGEMENT
 * Using httpOnly and secure flags for production-grade security
 */

const setAccessTokenCookie = (res: Response, token: string) => {
  CookieUtils.setCookie(res, "accessToken", token, {
    httpOnly: true,
    secure: envVars.NODE_ENV === "production", // Only true in production
    sameSite: "none",
    path: "/",
    maxAge: 1000 * 60 * 60 * 24, // 1 day in milliseconds
  });
};

const setRefreshTokenCookie = (res: Response, token: string) => {
  CookieUtils.setCookie(res, "refreshToken", token, {
    httpOnly: true,
    secure: envVars.NODE_ENV === "production",
    sameSite: "none",
    path: "/",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days in milliseconds
  });
};

const setBetterAuthSessionCookie = (res: Response, token: string) => {
  CookieUtils.setCookie(res, "better-auth.session_token", token, {
    httpOnly: true,
    secure: envVars.NODE_ENV === "production",
    sameSite: "none",
    path: "/",
    maxAge: 1000 * 60 * 60 * 24, //CHANGE: From 1 day to 7 days if you want the session to last longer.
  });
};

export const tokenUtils = {
  getAccessToken,
  getRefreshToken,
  setAccessTokenCookie,
  setRefreshTokenCookie,
  setBetterAuthSessionCookie,
};
