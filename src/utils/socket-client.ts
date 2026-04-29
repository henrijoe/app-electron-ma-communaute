import { io, type Socket } from 'socket.io-client';

import { resolveApiBaseUrl } from 'src/utils/apiClient';

type SocketEventPayload = {
  idUtilisateur?: number | null;
  idMembre?: number | null;
  [key: string]: unknown;
};

let socketInstance: Socket | null = null;

const getSocketBaseUrl = () => {
  const baseUrl = resolveApiBaseUrl();
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
};

export const getCommunauteSocket = (): Socket | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  if (socketInstance) {
    if (!socketInstance.connected) {
      socketInstance.connect();
    }
    return socketInstance;
  }

  socketInstance = io(getSocketBaseUrl(), {
    autoConnect: true,
    reconnection: true,
    transports: ['websocket', 'polling'],
  });

  return socketInstance;
};

export const subscribeToCommunauteEvent = (
  eventName: string,
  callback: (payload: SocketEventPayload) => void
) => {
  const socket = getCommunauteSocket();

  if (!socket) {
    return () => undefined;
  }

  const handler = (payload: SocketEventPayload = {}) => {
    callback(payload || {});
  };

  socket.on(eventName, handler);

  return () => {
    socket.off(eventName, handler);
  };
};
