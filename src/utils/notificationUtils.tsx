// src/utils/useLocalNotificationScheduler.ts
import { LocalNotifications } from '@capacitor/local-notifications';
import { useEffect, useMemo } from 'react';
import { useGlobalState } from '../realtime/GlobalStateContext';

const useLocalNotificationScheduler = () => {
  const { notifications } = useGlobalState();

  const structuredNotifications = useMemo(() => {
    return notifications.map(notification => ({
      id: notification?._id?.$oid,
      title: 'New Notification', // You can customize the title as needed
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
          id: data.id,
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
    if (structuredNotifications.length > 0) {
      const latestNotification = structuredNotifications[structuredNotifications.length - 1];
      sendNotification(latestNotification);
    }
  }, [structuredNotifications]);
};

export default useLocalNotificationScheduler;
