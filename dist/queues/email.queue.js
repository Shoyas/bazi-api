"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailQueue = void 0;
const bullmq_1 = require("bullmq");
const connection_1 = require("./connection");
exports.emailQueue = new bullmq_1.Queue('email-queue', { connection: connection_1.connection });
