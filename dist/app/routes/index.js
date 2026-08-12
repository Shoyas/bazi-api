"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_routes_1 = require("../modules/auth/auth.routes");
const apiKey_routes_1 = require("../modules/apiKey/apiKey.routes");
const subscription_routes_1 = require("../modules/subscription/subscription.routes");
const bazi_routes_1 = require("../modules/bazi/bazi.routes");
const user_routes_1 = require("../modules/user/user.routes");
const systemSetting_routes_1 = require("../modules/systemSetting/systemSetting.routes");
const router = express_1.default.Router();
const moduleRoutes = [
    {
        path: '/auth',
        route: auth_routes_1.AuthRoutes,
    },
    {
        path: '/api-keys',
        route: apiKey_routes_1.ApiKeyRoutes,
    },
    {
        path: '/subscriptions',
        route: subscription_routes_1.SubscriptionRoutes,
    },
    {
        path: '/bazi',
        route: bazi_routes_1.BaziRoutes,
    },
    {
        path: '/users',
        route: user_routes_1.UserRoutes,
    },
    {
        path: '/system-settings',
        route: systemSetting_routes_1.SystemSettingRoutes,
    },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));
exports.default = router;
