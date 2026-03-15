/* eslint-disable @typescript-eslint/no-explicit-any */
import status from "http-status";
import { IErrorSources } from "../interfaces/error.interface";
import { Prisma } from "../../generated/prisma/client";

const getStatusCodeFromPrismaError = (errorCode: string): number => {
  if (errorCode === "P2002") return status.CONFLICT;
  if (["P2025", "P2001", "P2015", "P2018"].includes(errorCode))
    return status.NOT_FOUND;
  if (["P1000", "P6002"].includes(errorCode)) return status.UNAUTHORIZED;
  if (errorCode.startsWith("P1")) return status.SERVICE_UNAVAILABLE;
  return status.BAD_REQUEST;
};

/**
 * Enhanced meta formatter to capture table, model, and constraint details
 * from Prisma's error meta-object.
 */
const formatPrismaMeta = (meta?: Record<string, any>): string => {
  if (!meta) return "";
  const parts: string[] = [];

  if (meta.target) parts.push(`Field(s): ${String(meta.target)}`);
  if (meta.cause) parts.push(`Cause: ${String(meta.cause)}`);
  if (meta.table) parts.push(`Table: ${String(meta.table)}`);
  if (meta.model_name) parts.push(`Model: ${String(meta.model_name)}`);
  if (meta.field_name) parts.push(`Field: ${String(meta.field_name)}`);
  if (meta.constraint) parts.push(`Constraint: ${String(meta.constraint)}`);

  return parts.length > 0 ? `| ${parts.join(" | ")}` : "";
};

export const handlePrismaError = (err: any) => {
  let statusCode: number = status.INTERNAL_SERVER_ERROR;
  let message = "A Database Error Occurred";
  let errorSources: IErrorSources[] = [];

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = getStatusCodeFromPrismaError(err.code);
    const cleanMsg = err.message
      .replace(/Invalid `.*?` invocation:?\s*/i, "")
      .split("\n")[0];
    message = `Database Error: ${cleanMsg}`;
    errorSources = [
      { path: err.code, message: `${cleanMsg} ${formatPrismaMeta(err.meta)}` },
    ];
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    /**
     * Added: Handling for Unknown Request Errors to capture edge cases
     */
    statusCode = status.INTERNAL_SERVER_ERROR;
    const cleanMsg = err.message
      .replace(/Invalid `.*?` invocation:?\s*/i, "")
      .split("\n")[0];
    message = `Unknown Database Error: ${cleanMsg}`;
    errorSources = [{ path: "PRISMA_UNKNOWN", message: cleanMsg }];
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = status.BAD_REQUEST;
    message = "Incorrect field Type/Value provided or Missing Fields";
    errorSources = [
      { path: "", message: err.message.split("\n").pop()?.trim() || message },
    ];
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    statusCode = status.SERVICE_UNAVAILABLE;
    message = "Could not connect to Database";
    errorSources = [{ path: "DB_CONNECTION", message }];
  } else if (err instanceof Prisma.PrismaClientRustPanicError) {
    statusCode = status.INTERNAL_SERVER_ERROR;
    message =
      "The database engine encountered a fatal error and crashed. This is usually due to an internal bug in the Prisma engine or an unexpected edge case in the database operation. Please check the Prisma logs for more details and consider reporting this issue to the Prisma team if it persists.";
    errorSources = [{ path: "Rust Engine Crashed", message }];
  }

  return { statusCode, message, errorSources };
};
