import express, { Application, Request, Response } from "express";
import { IndexRoutes } from "./app/routes";
import globalErrorHandler from "./app/error/globalErrorHandler";
import notFoundHandler from "./app/error/routeNotFound";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./app/lib/auth";
import path from "path";
import { envVars } from "./config/env";
import cors from "cors";
import qs from "qs";
import { PaymentController } from "./app/modules/payment/payment.controller";
import cron from "node-cron";
import { AppointmentService } from "./app/modules/appointment/appointment.service";

//express
const app: Application = express();

//query parser
app.set("query parser", (str: string) => qs.parse(str));

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), `src/app/templates`));

//payment webhook event-handler
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  PaymentController.handleStripeWebhookEvent,
);

//cors middleware
app.use(
  cors({
    origin: [
      envVars.FRONTEND_URL,
      envVars.BETTER_AUTH_URL,
      "http://localhost:3000",
      "http://localhost:5000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
// Middleware to parse JSON bodies and cookies
app.use(express.json());
app.use(cookieParser());
// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", toNodeHandler(auth));

// Basic route
app.get("/", (req: Request, res: Response) => {
  res.send("Hello! from PH-healthcare Server :)");
});

// node-cron
cron.schedule("*/25 * * * *", async () => {
  try {
    console.log("Running cron job to cancel unpaid appointments");
    await AppointmentService.cancelUnpaidAppointmentsInDB();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error running cron job:", error);
  }
});

//Business Logic (auth, models..)
app.use("/api/v1", IndexRoutes);

//Route not found
app.use(notFoundHandler);

//Global Error
app.use(globalErrorHandler);

export default app;
