import express from 'express';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { ApiKeyRoutes } from '../modules/apiKey/apiKey.routes';
import { SubscriptionRoutes } from '../modules/subscription/subscription.routes';
import { BaziRoutes } from '../modules/bazi/bazi.routes';
import { UserRoutes } from '../modules/user/user.routes';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/api-keys',
    route: ApiKeyRoutes,
  },
  {
    path: '/subscriptions',
    route: SubscriptionRoutes,
  },
  {
    path: '/bazi',
    route: BaziRoutes,
  },
  {
    path: '/users',
    route: UserRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
