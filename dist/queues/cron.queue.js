"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cronQueue = void 0;
const bullmq_1 = require("bullmq");
const connection_1 = require("./connection");
exports.cronQueue = new bullmq_1.Queue('cron-queue', { connection: connection_1.connection });
