import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";

export const validateRequest = (zodSchema: ZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Handle stringified data (form-data/multer)
      if (req.body.data && typeof req.body.data === "string") {
        req.body = JSON.parse(req.body.data);
      }

      // 2. Validate. Pass the structure that matches your Schema!
      const parsedResult = await zodSchema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
        cookies: req.cookies,
      });

      // 3. Sanitize/Update req with validated data
      req.body = parsedResult.body;

      // Use Object.assign for query/params to avoid the "Getter only" error
      if (parsedResult.query) {
        Object.assign(req.query, parsedResult.query);
      }
      if (parsedResult.params) {
        Object.assign(req.params, parsedResult.params);
      }

      next();
    } catch (err) {
      // Passes ZodError to your globalErrorHandler
      next(err);
    }
  };
};

export default validateRequest;
