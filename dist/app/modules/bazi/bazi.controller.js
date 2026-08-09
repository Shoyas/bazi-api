"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaziController = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const bazi_service_1 = require("./bazi.service");
const calculateBazi = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.apiKeyUser?.userId;
    let user = null;
    if (userId) {
        const { prisma } = require('../../../shared/prisma');
        user = await prisma.user.findUnique({ where: { id: userId }, include: { subscription: true } });
    }
    const result = await bazi_service_1.BaziService.calculateBazi(req.body, user);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'BaZi calculated successfully.',
        data: result,
    });
});
exports.BaziController = {
    calculateBazi,
};
