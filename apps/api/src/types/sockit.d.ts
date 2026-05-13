import { User } from '@perpx/shared';

declare global {
  namespace SocketIO {
    interface Socket {
      data: {
        user?: User;
        userId?: string;
      };
    }
  }
}
