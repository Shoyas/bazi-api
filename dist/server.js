"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const seed_1 = require("./shared/seed");
const otpCleanup_1 = require("./jobs/otpCleanup");
const PORT = process.env.PORT || 3031;
const startServer = async () => {
    await (0, seed_1.seedSuperAdmin)();
    (0, otpCleanup_1.initCronJobs)();
    const server = app_1.default.listen(PORT, () => {
        console.log(`Server is running on port: ${PORT}`);
    });
    process.on("unhandledRejection", (err) => {
        console.error(`UnhandledRejection: ${err.message}`);
        server.close(() => {
            process.exit(1);
        });
    });
};
startServer();
process.on("uncaughtException", (err) => {
    console.error(`UncaughtException: ${err.message}`);
    process.exit(1);
});
