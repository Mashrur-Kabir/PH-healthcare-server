import status from "http-status";
import { ZodError } from "zod";
import { IErrorSources } from "../interfaces";

export const handleZodError = (err: ZodError) => {
  const statusCode = status.BAD_REQUEST;
  const message = "Zod Validation Error";

  const errorSources: IErrorSources[] = err.issues.map((issue) => {
    /**
     * Instead of filtering out 'body', let's keep the full path
     * but join it with dots.
     * This way, if it's 'body.startDate', you know it's a structural issue.
     */
    return {
      path: issue.path.join("."),
      location: issue.path[0],
      message: issue.message,
    };
  });

  // MUST return this object
  return {
    statusCode,
    message,
    errorSources,
  };
};
