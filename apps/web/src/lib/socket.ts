import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getSocket = (token: string) => {
  console.warn('Getting socket with token:', token ? 'provided' : 'missing');
  console.warn('API_URL:', API_URL);

  if (!socket) {
    console.warn('Creating new socket connection...');
    socket = io(`${API_URL}/chat`, {
      path: '/socket.io',
      auth: { token },
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.warn('Socket connected successfully', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.warn('Socket disconnected', reason);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connect error:', err.message);
      console.error('Full error:', err);
    });
  } else {
    console.warn('Reusing existing socket, updating auth token');
    socket.auth = { token };
  }

  return socket;
};
