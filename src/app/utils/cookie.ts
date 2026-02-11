import { CookieOptions, Request, Response } from "express";

/**
 * Sets a cookie on the response object.
 * @param res - Express Response object
 * @param key - The name of the cookie
 * @param value - The token or string to store
 * @param options - Standard Express CookieOptions
 */
const setCookie = (
  res: Response,
  key: string,
  value: string,
  options: CookieOptions,
): void => {
  res.cookie(key, value, options);
};

/**
 * Retrieves a cookie from the request object.
 * Note: Requires 'cookie-parser' middleware to be installed and used in app.ts
 */
const getCookie = (req: Request, key: string): string | undefined => {
  return req.cookies?.[key];
};

/**
 * Clears a cookie.
 * Note: To clear successfully, 'path' and 'domain' in options must match
 * the settings used when the cookie was created.
 */
const clearCookie = (
  res: Response,
  key: string,
  options: CookieOptions = { path: "/" },
): void => {
  res.clearCookie(key, options);
};

export const CookieUtils = {
  setCookie,
  getCookie,
  clearCookie,
};
