import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";

const validateRequest = (schema: ZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Parse the request against the schema
      // This checks req.body, req.query, and req.cookies if defined in schema
      const result = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
        cookies: req.cookies,
      });

      //sanitization:
      req.body = result.body; //sIf the user sent extra junk fields (like location: "Mars"), Zod strips them out, and the "clean" data is put back into req.body.
      next();
    } catch (err) {
      // If validation fails, pass the Zod error to the global error handler
      next(err);
    }
  };
};

export default validateRequest;
