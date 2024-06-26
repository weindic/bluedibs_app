// src/services/notificationService.ts

import { Plugins, PushNotification, PushNotificationToken, PushNotificationActionPerformed } from '@capacitor/core';
const { PushNotifications } = Plugins;

export const requestNotificationPermission = async (): Promise<boolean> => {
  let granted = false;

  try {
    // Request permission to use push notifications
    const permStatus = await PushNotifications.requestPermissions();

    if (permStatus.receive === 'granted') {
      // Register with the push notification service
      const registration = await PushNotifications.register();

      // Set granted to true upon successful registration
      granted = true;

      // Listen for push notifications
      PushNotifications.addListener('registration', (token: PushNotificationToken) => {
        console.log('Push registration success, token: ' + token.value);
      });

      PushNotifications.addListener('registrationError', (error: any) => {
        console.error('Push registration error: ', error);
      });

      PushNotifications.addListener('pushNotificationReceived', (notification: PushNotification) => {
        console.log('Push notification received: ', notification);
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (notification: PushNotificationActionPerformed) => {
        console.log('Push notification action performed: ', notification);
      });

    } else {
      console.log('Push notification permission not granted');
    }

    // You can similarly handle other permissions (e.g., location, media) here

  } catch (error) {
    console.error('Error requesting permissions:', error);
  }

  return granted;
};
