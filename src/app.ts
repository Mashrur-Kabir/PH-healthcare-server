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

const app: Application = express();

//query parser
app.set("query parser", (str: string) => qs.parse(str));

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

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), `src/app/templates`));

app.use("/api/auth", toNodeHandler(auth));

// Basic route
app.get("/", (req: Request, res: Response) => {
  res.send("Hello! from PH-healthcare Server :)");
});

//Business Logic (auth, models..)
app.use("/api/v1", IndexRoutes);

//Route not found
app.use(notFoundHandler);

//Global Error
app.use(globalErrorHandler);

export default app;
