import { Request, Response } from "express";

// Catch-all for undefined routes
const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route '${req.originalUrl}' not found`,
    dateOfRequest: new Date().toLocaleString(),
  });
};

export default notFoundHandler;
