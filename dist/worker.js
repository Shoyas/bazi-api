"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
// Load config first
require('dotenv').config({ path: path_1.default.join(process.cwd(), '.env') });
console.log('[Worker Process] Booting up BullMQ workers...');
// Importing the workers index initializes the workers and their queue connections
require("./workers");
process.on("unhandledRejection", (err) => {
    console.error(`[Worker Process] UnhandledRejection: ${err.message}`);
});
process.on("uncaughtException", (err) => {
    console.error(`[Worker Process] UncaughtException: ${err.message}`);
    process.exit(1);
});
