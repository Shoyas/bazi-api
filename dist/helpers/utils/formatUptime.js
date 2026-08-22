"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatUptime = void 0;
const formatUptime = (seconds) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hrs = Math.floor((seconds % (3600 * 24)) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const parts = [];
    if (days > 0)
        parts.push(`${days}d`);
    if (hrs > 0 || days > 0)
        parts.push(`${hrs}h`);
    parts.push(`${mins}m`);
    parts.push(`${secs}s`);
    return parts.join(" ");
};
exports.formatUptime = formatUptime;
