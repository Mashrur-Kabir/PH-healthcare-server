import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import status from "http-status";
import { Prisma } from "../../generated/prisma/client";
import { formatErrorStack } from "../helpers/formatErrorStack";
import { AppError } from "./AppError";
import { ZodError } from "zod";
import { IErrorResponse, IErrorSources } from "../interfaces/error.interface";
import { handleZodError } from "./zodError";
import { deleteFileFromCloudinary } from "../../config/cloudinary.config";

const globalErrorHandler: ErrorRequestHandler = async (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  /**
   * --- CLEANUP LOGIC ---
   * If an error occurs, check if a file was uploaded and delete it
   */
  if (req.file && req.file.path) {
    await deleteFileFromCloudinary(req.file.path);
  }

  // Handle multiple files if you use upload.array() or upload.fields()
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    const filePaths = (req.files as Express.Multer.File[]).map(
      (file) => file.path,
    );
    await Promise.all(filePaths.map((path) => deleteFileFromCloudinary(path)));
  }

  // Explicitly set type to number to avoid literal type inference
  let statusCode: number = status.INTERNAL_SERVER_ERROR;
  let message = "Internal Server Error!";
  let errorSources: IErrorSources[] = [];

  /**
   * 1. Prisma Validation Errors
   */
  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = status.BAD_REQUEST;
    message = "Incorrect field Type/Value provided or Missing Fields";

    const lines = err.message?.split("\n") ?? [];
    errorSources = [
      {
        path: "",
        message: lines[lines.length - 1]?.trim(),
      },
    ];
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    /**
     * 2. Prisma Known Request Errors
     */
    statusCode = status.BAD_REQUEST;

    if (err.code === "P2025") {
      message = "Operation failed because the record was not found";
      statusCode = status.NOT_FOUND;
    } else if (err.code === "P2002") {
      message = "Duplicate value found (Unique constraint violation)";
      statusCode = status.CONFLICT;
    } else if (err.code === "P2003") {
      message = "Foreign key constraint violation";
    }
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    /**
     * 3. Prisma Unknown Request Errors
     */
    statusCode = status.INTERNAL_SERVER_ERROR;
    message = "An unexpected Prisma error occurred! Please try again later.";
  } else if (err instanceof Prisma.PrismaClientRustPanicError) {
    /**
     * 4. Prisma Rust Panic Errors
     */
    statusCode = status.INTERNAL_SERVER_ERROR;
    message =
      "Critical Database Error! Engine crashed. Please try again later.";
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    /**
     * 5. Prisma Initialization Errors
     */
    if (err.errorCode === "P1000") {
      statusCode = status.UNAUTHORIZED;
      message = "Authentication Failed. Please check your credentials.";
    } else if (err.errorCode === "P1001") {
      statusCode = status.SERVICE_UNAVAILABLE;
      message = "Cannot reach database. Please try again later";
    }
  } else if (err instanceof ZodError) {
    /**
     * 6. Zod Validation Errors
     */
    const zodError = handleZodError(err);

    statusCode = zodError.statusCode;
    message = zodError.message;
    errorSources = zodError.errorSources;
  } else if (err instanceof AppError) {
    /**
     * 7. Custom App Errors
     */
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Error) {
    /**
     * 8. Generic JS Errors
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
