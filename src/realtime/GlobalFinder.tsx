import React, { useEffect } from 'react';
import { useGlobalState } from './GlobalStateContext';

const GlobalFinder: React.FC = () => {
  const { notifications, userId } = useGlobalState();

  useEffect(() => {
    console.log('Real-time notifications:', notifications);
  }, [notifications]);

  return (
    <div>
      <h2>Live Notifications for User {userId}</h2>
      <ul>
        {notifications.map((notification, index) => (
          <li key={notification.id}>{notification.message}</li>
        ))}
      </ul>
    </div>
  );
};

export default GlobalFinder;