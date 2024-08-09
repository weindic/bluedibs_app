import { LocalNotifications } from '@capacitor/local-notifications';
import { useEffect, useMemo, useRef } from 'react';
import { useGlobalState } from '../realtime/GlobalStateContext';

const useLocalNotificationScheduler = () => {
  const { notifications } = useGlobalState();
  const notificationIdCounter = useRef<number>(0);

  // Function to request notification permissions
  const requestPermissions = async () => {
    const { receive }:any = await LocalNotifications.requestPermissions();
    if (receive !== 'granted') {
      console.warn('Notification permissions not granted');
    }
  };

  // Use `useMemo` to compute structured notifications based on `notifications`
  const structuredNotifications = useMemo(() => {
    return notifications.map(notification => ({
      id: ++notificationIdCounter.current,
      title: 'Blue Dibs',
      message: notification?.message,
      time: new Date(new Date().getTime() + 5000), // Schedule for 5 seconds later
      sourceId: notification?.sourceId,
    }));
  }, [notifications]);

  // Function to send a notification using Capacitor Local Notifications
  const sendNotification = async (data: any) => {
    await LocalNotifications.schedule({
      notifications: [
        {
          title: data.title,
          body: data.message,
          id: data.id,
          schedule: { at: data.time }, // Schedule the notification
          sound: '/notif.mp3',
          attachments: [],
          actionTypeId: data.sourceId,
          extra: null,
        },
      ],
    });
  };

  useEffect(() => {
    // Request permissions when the component mounts
    requestPermissions();

    // Send all notifications from the structured notifications array
    structuredNotifications.forEach(notification => {
      sendNotification(notification);
    });

    // Clean up function to cancel all scheduled notifications
    return () => {
      structuredNotifications.forEach(notification => {
        LocalNotifications.cancel({ notifications: [{ id: notification.id }] });
      });
    };
  }, [structuredNotifications]); // Depend on `structuredNotifications`

};

export default useLocalNotificationScheduler;
