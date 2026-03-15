import app from "./app";
import { logger } from "./app/utils/logger";
import { seedSuperAdmin } from "./app/utils/seed";
import { envVars } from "./config/env";
import { Server } from "http";

const PORT = envVars.PORT;

const bootstrap = async () => {
  let server: Server;

  try {
    // seed admin first:
    await seedSuperAdmin();

    server = app.listen(PORT, () => {
      logger.success(`Server is running on http://localhost:${PORT}`);
    });

    // --- GRACEFUL SHUTDOWN LOGIC ---

    /**
     * Gracefully shuts down the server by closing the HTTP listener
     * and then exiting the process.
     */
    const gracefulShutdown = (signal: string) => {
      logger.warn(`${signal} received. Starting graceful shutdown...`);

      if (server) {
        server.close(() => {
          logger.success("HTTP server closed.");
          process.exit(0);
        });
      } else {
        process.exit(0);
      }
    };

    // Listen for SIGINT (typically Ctrl+C)
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    // Listen for SIGTERM (typically sent by hosting platforms/Docker)
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (err) => {
      logger.error("Unhandled Rejection detected. Shutting down...", err);
      if (server) {
        server.close(() => process.exit(1));
      } else {
        process.exit(1);
      }
    });

    // Handle uncaught exceptions
    process.on("uncaughtException", (err) => {
      logger.error("Uncaught Exception detected. Shutting down...", err);
      process.exit(1);
    });
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
};

bootstrap();
