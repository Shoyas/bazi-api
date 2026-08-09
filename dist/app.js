"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const cors_2 = __importDefault(require("../src/config/cors"));
const webhook_routes_1 = require("./app/modules/webhook/webhook.routes");
const routes_1 = __importDefault(require("./app/routes"));
const config_1 = __importDefault(require("./config"));
const formatUptime_1 = require("./helpers/utils/formatUptime");
const app = (0, express_1.default)();
// Webhook Routes (Must be before express.json)
app.use("/api/v1/webhook", webhook_routes_1.WebhookRoutes);
// Middlewares
app.use((0, cors_1.default)(cors_2.default));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// Routes
app.use("/api/v1", routes_1.default);
// Root Route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "BaZi API Server is running.",
        environment: config_1.default.node_env,
        port: config_1.default.port,
        uptime: (0, formatUptime_1.formatUptime)(process.uptime()),
        timestamp: new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        }),
    });
});
// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.path}`,
    });
});
// Global Error Handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Something went wrong!",
    });
});
exports.default = app;
