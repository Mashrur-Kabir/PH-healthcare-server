import app from "./app";
import { logger } from "./app/utils/logger";
import { seedSuperAdmin } from "./app/utils/seed";
import { envVars } from "./config/env";

const PORT = envVars.PORT;

const bootstrap = async () => {
  try {
    //seed admin first:
    await seedSuperAdmin();

    const server = app.listen(PORT, () => {
      logger.success(`Server is running on http://localhost:${PORT}`);
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (err) => {
      logger.error("Unhandled Rejection detected. Shutting down...", err);
      server.close(() => process.exit(1));
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
