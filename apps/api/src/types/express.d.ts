// src/types/express.d.ts
import { User } from '@perpx/shared';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};
