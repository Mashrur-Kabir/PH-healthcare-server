import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import status from "http-status";
import { Prisma } from "../../generated/prisma/client";
import { formatErrorStack } from "../helpers/formatErrorStack";
import { AppError } from "./AppError";
import { ZodError } from "zod";
import { IErrorResponse, IErrorSources } from "../interfaces/error.interface";
import { handleZodError } from "./zodError";
import { deleteUploadedFilesFromGlobalErrorHandler } from "../utils/deleteUploadedFilesFromGEH";
import { handlePrismaError } from "../helpers/handlePrismaErrors";

const globalErrorHandler: ErrorRequestHandler = async (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  /**
   * --- CLEANUP LOGIC IN CLOUDINARY ---
   * If an error occurs, check if a file was uploaded and delete it
   */
  await deleteUploadedFilesFromGlobalErrorHandler(req);

  // Explicitly set type to number to avoid literal type inference
  let statusCode: number = status.INTERNAL_SERVER_ERROR;
  let message = "Internal Server Error!";
  let errorSources: IErrorSources[] = [];

  if (
    /**
     * Prisma Errors
     */
    err instanceof Prisma.PrismaClientValidationError ||
    err instanceof Prisma.PrismaClientKnownRequestError ||
    err instanceof Prisma.PrismaClientInitializationError ||
    err instanceof Prisma.PrismaClientRustPanicError ||
    err instanceof Prisma.PrismaClientUnknownRequestError
  ) {
    const simplified = handlePrismaError(err);
    statusCode = simplified.statusCode;
    message = simplified.message;
    errorSources = simplified.errorSources;
  } else if (err instanceof ZodError) {
    /**
     * Zod Validation Errors
     */
    const zodError = handleZodError(err);

    statusCode = zodError.statusCode;
    message = zodError.message;
    errorSources = zodError.errorSources;
  } else if (err instanceof AppError) {
    /**
     * Custom App Errors
     */
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Error) {
    /**
     * Generic JS Errors
     */
    statusCode = status.INTERNAL_SERVER_ERROR;
    message = err.message;
    errorSources = [
      {
        path: "root",
        message: err.message,
      },
    ];
  }

  // At the bottom of your globalErrorHandler
  const errorResponse: IErrorResponse = {
    success: false,
    message,
    errors: errorSources.length ? errorSources : undefined,
    stack: formatErrorStack(err),
  };

  res.status(statusCode).json(errorResponse);
};

export default globalErrorHandler;
