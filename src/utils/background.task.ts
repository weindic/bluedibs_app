// src/services/BackgroundTaskService.ts
import { Plugins } from '@capacitor/core';
import { useEffect } from 'react';

const { BackgroundTask, LocalNotifications } = Plugins;

const BackgroundTaskService = () => {
  useEffect(() => {
    const handleBackgroundTask = async () => {
      try {
        // Fetch notifications data from your server or storage
        const notificationsData = await fetchNotificationsFromServer();

        // Schedule notifications using Capacitor's Local Notifications plugin
        await LocalNotifications.schedule({
          notifications: notificationsData.map(notification => ({
            title: 'New Notification',
            body: notification.message,
            id: notification.id.toString(),
            schedule: { at: new Date(notification.time) },
            sound: '/notif.mp3',
            attachments: [],
            actionTypeId: notification.sourceId,
            extra: null,
          })),
        });

        console.log('Scheduled notifications:', notificationsData);
      } catch (error) {
        console.error('Error scheduling notifications:', error);
      }
    };

    // Register background task handler
    BackgroundTask.register({
      taskId: 'backgroundFetchTask',
      taskName: 'Fetch Notifications',
      taskIcon: 'icon',
      taskData: {},
      timeout: 15000, // Maximum execution time in milliseconds
      periodic: true, // Set to true for periodic tasks
    });

    // Handle background task execution
    BackgroundTask.addExecutionListener(async () => {
      console.log('Executing background task...');

      // Perform background tasks (e.g., fetch and schedule notifications)
      await handleBackgroundTask();

      // Finish background task
      BackgroundTask.finish();
    });

    // Start the background task
    BackgroundTask.start();

    // Clean up when component unmounts
    return () => {
      BackgroundTask.removeListeners();
    };
  }, []);

  return null;
};

export default BackgroundTaskService;
