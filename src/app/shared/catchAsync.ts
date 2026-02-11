// src/utils/catchAsync.ts
// handling boilerplate code via higher-order function

import { NextFunction, Request, RequestHandler, Response } from "express";

export const catchAsync = (fn: RequestHandler) => {
  // This is the "Box" we are giving to Express.
  // We MUST define req, res, next here because Express will
  // try to pass them in when a request happens.
  return (req: Request, res: Response, next: NextFunction) => {
    // Now we take those 3 things Express gave us and
    // "pipe" them into your original logic (fn).
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  };
};
