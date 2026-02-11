import status from "http-status";
import { ZodError } from "zod";
import { IErrorSources } from "../interfaces";

export const handleZodError = (err: ZodError) => {
  const statusCode = status.BAD_REQUEST;
  const message = "Zod Validation Error";

  const errorSources: IErrorSources[] = err.issues.map((issue) => {
    const filteredPath = issue.path.filter((p) => p !== "body");

    return {
      path: filteredPath.length > 0 ? filteredPath.join(".") : "root",
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
