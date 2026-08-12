"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sendResponse = (res, data) => {
    const responseData = {
        success: data.success,
        message: data.message || null,
        data: data.data || null,
    };
    if (data.meta) {
        responseData.meta = data.meta;
    }
    res.status(data.statusCode).json(responseData);
};
exports.default = sendResponse;
