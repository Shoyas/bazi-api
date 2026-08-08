import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload | null;
      apiKeyUser?: {
        userId: string;
        plan: string;
      } | null;
    }
  }
}
