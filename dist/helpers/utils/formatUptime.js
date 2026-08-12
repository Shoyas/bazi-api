"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatUptime = void 0;
const formatUptime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const pad = (n) => n.toString().padStart(2, "0");
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
};
exports.formatUptime = formatUptime;
