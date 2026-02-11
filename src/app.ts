import express, { Application, Request, Response } from "express";
import { IndexRoutes } from "./app/routes";
import globalErrorHandler from "./app/error/globalErrorHandler";
import notFoundHandler from "./app/error/routeNotFound";
import cookieParser from "cookie-parser";

const app: Application = express();

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies and cookies
app.use(express.json());
app.use(cookieParser());

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
