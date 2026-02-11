import { envVars } from "../../config/env";

export const formatErrorStack = (err: unknown) => {
  return envVars.NODE_ENV === "development" && err instanceof Error
    ? err.stack
        ?.split("\n")
        .map((line: string) => line.trim()) // Explicitly typed as string
        .filter(
          (
            line: string, // Explicitly typed as string
          ) =>
            line &&
            !line.includes("node_modules") &&
            !line.includes("internal/"),
        )
    : undefined;
};
