// src/types/express.d.ts
import { AuthUser } from '../auth/types/authUser.type';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
