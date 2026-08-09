import express, { Application, Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import corsOptions from "../src/config/cors";
import { WebhookRoutes } from "./app/modules/webhook/webhook.routes";
import router from "./app/routes";
import config from "./config";
import { formatUptime } from "./helpers/utils/formatUptime";

const app: Application = express();

// Webhook Routes (Must be before express.json)
app.use("/api/v1/webhook", WebhookRoutes);

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/v1", router);

// Root Route
app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "BaZi API Server is running.",
    environment: config.node_env,
    port: config.port,
    uptime: formatUptime(process.uptime()),
    timestamp: new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
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
