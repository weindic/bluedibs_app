import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import io from 'socket.io-client';

const SOCKET_SERVER_URL = 'wss://server.bluedibs.com'; // Replace with your WebSocket server URL
const NOTIFICATION_API_URL = 'https://server.bluedibs.com/notification-alerts/realtime/user';

interface Notification {
  id: string;
  message: string;
}

interface GlobalState {
  notifications: Notification[];
  userId: string | null;
}

interface GlobalStateProviderProps {
  children: ReactNode;
}

const GlobalStateContext = createContext<GlobalState | undefined>(undefined);

export const GlobalStateProvider: React.FC<GlobalStateProviderProps> = ({ children }: any) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL);

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      if (userId) {
        socket.emit('register', { userId });
      }
    });

    socket.on('notifications', (newNotifications: Notification[]) => {
      console.log('Received new notifications:', newNotifications);
      setNotifications((prevNotifications: Notification[]) => [...prevNotifications, ...newNotifications]);
    });

    socket.on('error', (error: any) => {
      console.error('WebSocket error:', error);
    });

    return () => {
      console.log('Disconnecting WebSocket...');
      socket.disconnect();
    };
  }, [userId]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!userId) return;
      try {
        const response = await fetch(`${NOTIFICATION_API_URL}/${userId}`);
        const notificationsData = await response.json();
        console.log('Fetched notifications:', notificationsData);
        setNotifications(notificationsData);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, [userId]);

  useEffect(() => {
    const localData = localStorage.getItem('bluedibs:user');
    if (localData) {
      const userData = JSON.parse(localData);
      setUserId(userData.id);
    }
  }, []);

  return (
    <GlobalStateContext.Provider value={{ notifications, userId }}>
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (context === undefined) {
    throw new Error('useGlobalState must be used within a GlobalStateProvider');
  }
  return context;
};
