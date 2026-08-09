"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connection = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const config_1 = __importDefault(require("../config"));
// BullMQ requires maxRetriesPerRequest: null
exports.connection = new ioredis_1.default(config_1.default.redis.url || 'redis://localhost:6380', {
    maxRetriesPerRequest: null,
});
exports.connection.on('error', (err) => {
    console.error('[BullMQ Redis] Connection error:', err);
});
