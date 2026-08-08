import express, { Application, Request, Response, NextFunction } from "express";
import { BaziRoutes } from "./app/modules/bazi/bazi.routes";

const app: Application = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/v1/bazi", BaziRoutes);

// Root Route
app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "BaZi API Server is running.",
  });
});

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`,
  });
});

// Global Error Handler
app.use(
  (
    err: Error & { statusCode?: number },
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const statusCode = (err as any).statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: err.message || "Something went wrong!",
    });
  },
);

export default app;
