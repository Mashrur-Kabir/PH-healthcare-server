import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import { AppError } from "../error/AppError";
import status from "http-status";

/**
 * 1. Create a JWT Token
 * Secure: Uses SignOptions to enforce expiration.
 */
const createToken = (
  payload: JwtPayload,
  secret: Secret,
  options: SignOptions,
): string => {
  return jwt.sign(payload, secret, options);
};

/**
 * 2. Verify a JWT Token
 * Efficient: Throws errors to be caught by the Global Error Handler.
 * Secure: Uses unknown type instead of any.
 */
const verifyToken = (token: string, secret: Secret): JwtPayload => {
  try {
    return jwt.verify(token, secret) as JwtPayload;
  } catch (err: unknown) {
    // Now we use AppError to send a specific 401 status
    if (err instanceof Error) {
      throw new AppError(status.UNAUTHORIZED, `JWT Error: ${err.message}`);
    }
    throw new AppError(
      status.UNAUTHORIZED,
      "Unauthorized access: Invalid token",
    );
  }
};

/**
 * 3. Decode a Token
 * Note: Use this ONLY when verification is not required (e.g., UI display).
 */
const decodeToken = (token: string): JwtPayload | null => {
  return jwt.decode(token) as JwtPayload;
};

export const jwtHelpers = {
  createToken,
  verifyToken,
  decodeToken,
};
