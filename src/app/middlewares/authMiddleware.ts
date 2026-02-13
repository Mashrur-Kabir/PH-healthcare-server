import { NextFunction, Request, Response } from "express";
import status from "http-status";
import { Role, UserStatus } from "../../generated/prisma/enums";

import { AppError } from "../error/AppError";
import { catchAsync } from "../shared/catchAsync";
import { CookieUtils } from "../utils/cookie";
import { jwtHelpers } from "../utils/jwt";
import { envVars } from "../../config/env";
import { prisma } from "../lib/prisma";

const checkAuth = (...roles: Role[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    /**
     * =========================================
     * 1️ VERIFY ACCESS TOKEN (JWT)
     * =========================================
     */
    const accessToken = CookieUtils.getCookie(req, "accessToken");

    if (!accessToken) {
      throw new AppError(status.UNAUTHORIZED, "Access token missing.");
    }

    const verifiedToken = jwtHelpers.verifyToken(
      accessToken,
      envVars.ACCESS_TOKEN_SECRET as string,
    );

    if (!verifiedToken) {
      throw new AppError(status.UNAUTHORIZED, "Invalid access token.");
    }

    /**
     * =========================================
     * 2️ VERIFY SESSION TOKEN FROM DB
     * =========================================
     */
    const sessionToken = CookieUtils.getCookie(
      req,
      "better-auth.session_token",
    );

    if (!sessionToken) {
      throw new AppError(status.UNAUTHORIZED, "Session token missing.");
    }

    const session = await prisma.session.findFirst({
      where: {
        token: sessionToken,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!session || !session.user) {
      throw new AppError(status.UNAUTHORIZED, "Session expired or invalid.");
    }

    const user = session.user;

    /**
     * =========================================
     * 3️ USER SECURITY CHECKS
     * =========================================
     */
    if (
      user.status === UserStatus.BLOCKED ||
      user.status === UserStatus.DELETED
    ) {
      throw new AppError(status.UNAUTHORIZED, "User is not active.");
    }

    if (user.isDeleted) {
      throw new AppError(status.UNAUTHORIZED, "User account deleted.");
    }

    if (!user.emailVerified) {
      throw new AppError(status.FORBIDDEN, "Email not verified.");
    }

    /**
     * =========================================
     * 4️ OPTIONAL: SESSION EXPIRY WARNING HEADERS
     * =========================================
     */
    const now = Date.now();
    const expiresAt = new Date(session.expiresAt).getTime();
    const createdAt = new Date(session.createdAt).getTime();

    const percentRemaining =
      ((expiresAt - now) / (expiresAt - createdAt)) * 100;

    if (percentRemaining < 20) {
      res.setHeader("X-Session-Refresh", "true");
      res.setHeader("X-Time-Remaining", (expiresAt - now).toString());
    }

    /**
     * =========================================
     * 5️ ATTACH AUTH USER TO REQUEST
     * =========================================
     */
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      status: user.status,
      image: user.image,
      isDeleted: user.isDeleted,
    };

    /**
     * =========================================
     * 6 ROLE AUTHORIZATION CHECK
     * =========================================
     */
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      throw new AppError(
        status.FORBIDDEN,
        "Forbidden! You are not authorized to perform this action.",
      );
    }

    next();
  });
};

export default checkAuth;
