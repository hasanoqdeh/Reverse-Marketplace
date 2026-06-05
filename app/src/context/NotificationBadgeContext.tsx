import React, {createContext, useCallback, useContext, useEffect, useRef, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {io, Socket} from 'socket.io-client';
import {getMyNotifications} from '../api/notifications';
import {SERVER_URL} from '../api/client';
import {useAuth} from './AuthContext';

const API_BASE = SERVER_URL;

interface BadgeContextValue {
  unreadCount: number;
  decrement: () => void;
  reset: () => void;
}

const NotificationBadgeContext = createContext<BadgeContextValue>({
  unreadCount: 0,
  decrement: () => {},
  reset: () => {},
});

export function NotificationBadgeProvider({children}: {children: React.ReactNode}) {
  const {user} = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  const decrement = useCallback(() => setUnreadCount(c => Math.max(0, c - 1)), []);
  const reset     = useCallback(() => setUnreadCount(0), []);

  useEffect(() => {
    setUnreadCount(0);
    if (!user?.id) return;

    let cancelled = false;
    let socket: Socket | null = null;

    getMyNotifications({limit: 1})
      .then(res => { if (!cancelled) setUnreadCount(res.unreadCount); })
      .catch(() => {});

    AsyncStorage.getItem('accessToken').then(token => {
      if (!token || cancelled) return;
      socket = io(API_BASE, {auth: {token}, transports: ['websocket']});
      socket.on('notification:new',     ()                           => setUnreadCount(c => c + 1));
      socket.on('notification:read',    ()                           => setUnreadCount(c => Math.max(0, c - 1)));
      socket.on('notification:all_read',()                           => setUnreadCount(0));
      socketRef.current = socket;
    });

    return () => {
      cancelled = true;
      socket?.disconnect();
      socketRef.current = null;
    };
  }, [user?.id]);

  return (
    <NotificationBadgeContext.Provider value={{unreadCount, decrement, reset}}>
      {children}
    </NotificationBadgeContext.Provider>
  );
}

export const useNotificationBadge = () => useContext(NotificationBadgeContext);
