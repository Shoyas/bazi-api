"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bazi_routes_1 = require("./app/modules/bazi/bazi.routes");
const app = (0, express_1.default)();
// Middlewares
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Routes
app.use("/api/v1/bazi", bazi_routes_1.BaziRoutes);
// Root Route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "BaZi API Server is running.",
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
