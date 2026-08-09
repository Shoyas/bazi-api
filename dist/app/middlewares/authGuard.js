"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = __importDefault(require("http-status"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AppError_1 = require("../../errors/AppError");
const authGuard = (...requiredRoles) => {
    return async (req, res, next) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                throw new AppError_1.AppError(http_status_1.default.UNAUTHORIZED, 'You are not authorized');
            }
            let verifiedUser = null;
            try {
                verifiedUser = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
            }
            catch (error) {
                throw new AppError_1.AppError(http_status_1.default.UNAUTHORIZED, 'Invalid token');
            }
            if (requiredRoles.length && !requiredRoles.includes(verifiedUser.role)) {
                throw new AppError_1.AppError(http_status_1.default.FORBIDDEN, 'Forbidden access');
            }
            req.user = verifiedUser;
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.default = authGuard;
