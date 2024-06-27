// src/utils/useLocalNotificationScheduler.ts
import { LocalNotifications } from '@capacitor/local-notifications';
import { useEffect, useMemo, useRef } from 'react';
import { useGlobalState } from '../realtime/GlobalStateContext';

const useLocalNotificationScheduler = () => {
  const { notifications } = useGlobalState();
  const notificationIdCounter = useRef<number>(0); // Counter for generating numeric IDs

  const structuredNotifications = useMemo(() => {
    return notifications.map(notification => ({
      id: ++notificationIdCounter.current, // Generate numeric ID
      title: 'Blue Dibs', // Customize title as needed
      message: notification?.message,
      time: new Date(new Date().getTime() + 5000), // Schedule for 5 seconds later
      sourceId: notification?.sourceId,
    }));
  }, [notifications]);

  const sendNotification = async (data: any) => {
    await LocalNotifications.schedule({
      notifications: [
        {
          title: data.title,
          body: data.message,
          id: data.id, // Ensure `id` is numeric
          schedule: { at: data.time },
          sound: '/notif.mp3',
          attachments: [],
          actionTypeId: data.sourceId,
          extra: null,
        },
      ],
    });
  };

  useEffect(() => {
    // Send fallback notification if there are no structured notifications
    if (structuredNotifications.length === 0) {
      const fallbackNotification = {
        title: 'Hello👋👋👋👋',
        body: 'Welcome to BlueDibs.',
        id: ++notificationIdCounter.current, // Generate a new numeric ID for fallback notification
        schedule: { at: new Date(new Date().getTime() + 10000) }, // Schedule after 10 seconds
        sound: '/notif.mp3',
        attachments: [],
        actionTypeId: null,
        extra: null,
      };

      sendNotification(fallbackNotification);
    }
  }, [structuredNotifications]);

  // Clean up function: Cancel all scheduled notifications
  useEffect(() => {
    return () => {
      structuredNotifications.forEach(notification => {
        LocalNotifications.cancel({ notifications: [{ id: notification.id }] });
      });
    };
  }, [structuredNotifications]);

};

export default useLocalNotificationScheduler;
