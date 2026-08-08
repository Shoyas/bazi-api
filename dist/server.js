"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const PORT = process.env.PORT || 3031;
const server = app_1.default.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});
process.on("unhandledRejection", (err) => {
    console.error(`UnhandledRejection: ${err.message}`);
    server.close(() => {
        process.exit(1);
    });
});
process.on("uncaughtException", (err) => {
    console.error(`UncaughtException: ${err.message}`);
    process.exit(1);
});
