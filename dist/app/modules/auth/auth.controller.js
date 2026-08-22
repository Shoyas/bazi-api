"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const auth_service_1 = require("./auth.service");
const registerUser = (0, catchAsync_1.default)(async (req, res) => {
    const result = await auth_service_1.AuthService.registerUser(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'User registered successfully. Please check your email for verification.',
        data: result,
    });
});
const verifyEmail = (0, catchAsync_1.default)(async (req, res) => {
    const { email, otp } = req.body;
    const result = await auth_service_1.AuthService.verifyEmail(email, otp);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Email verified successfully',
        data: result,
    });
});
const loginUser = (0, catchAsync_1.default)(async (req, res) => {
    const result = await auth_service_1.AuthService.loginUser(req.body);
    const { refreshToken, ...responseData } = result;
    // Set refresh token as HttpOnly cookie
    const refreshExpirySeconds = parseInt(process.env.JWT_REFRESH_EXPIRES_IN_SECONDS || '15552000', 10);
    const cookieOptions = {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'strict',
        maxAge: refreshExpirySeconds * 1000,
    };
    res.cookie('refreshToken', refreshToken, cookieOptions);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'User logged in successfully',
        data: responseData,
    });
});
const refreshToken = (0, catchAsync_1.default)(async (req, res) => {
    const token = req.cookies.refreshToken || req.body.refreshToken;
    if (!token) {
        throw new Error('Refresh token is required'); // Or use AppError
    }
    const result = await auth_service_1.AuthService.refreshToken(token);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Access token refreshed successfully',
        data: result,
    });
});
const changePassword = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.user?.userId; // Assuming authGuard sets req.user
    await auth_service_1.AuthService.changePassword(userId, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Password changed successfully. All other sessions have been logged out.',
        data: null,
    });
});
const forgotPassword = (0, catchAsync_1.default)(async (req, res) => {
    await auth_service_1.AuthService.forgotPassword(req.body.email);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Password reset code sent to your email',
        data: null,
    });
});
const resetPassword = (0, catchAsync_1.default)(async (req, res) => {
    await auth_service_1.AuthService.resetPassword(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Password reset successfully',
        data: null,
    });
});
const getMe = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.user?.userId;
    const result = await auth_service_1.AuthService.getMe(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'User profile retrieved successfully',
        data: result,
    });
});
const logout = (0, catchAsync_1.default)(async (req, res) => {
    const token = req.cookies.refreshToken;
    const userId = req.user?.userId;
    if (token && userId) {
        await auth_service_1.AuthService.logout(token, userId);
    }
    res.clearCookie('refreshToken');
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Logged out successfully',
        data: null,
    });
});
exports.AuthController = {
    registerUser,
    verifyEmail,
    loginUser,
    refreshToken,
    changePassword,
    forgotPassword,
    resetPassword,
    getMe,
    logout,
};
