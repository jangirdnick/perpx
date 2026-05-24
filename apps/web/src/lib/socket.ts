import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

let socket: Socket | null = null;

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL;

export const getSocket = (token: string) => {
  if (!socket) {
    socket = io(`${API_URL}/chat`, {
      path: '/socket.io',
      auth: { token },
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect_error', (err) => {
      toast.error('Connection error', {
        description: err.message,
      });
    });
  } else {
    socket.auth = { token };
  }

  return socket;
};
