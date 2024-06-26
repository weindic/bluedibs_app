// // src/components/DummyPushNotification.tsx
// import React, { useEffect } from 'react';
// import { PushNotifications } from '@capacitor/push-notifications';

// const DummyPushNotification: React.FC = () => {
//   useEffect(() => {
//     const sendDummyNotification = async () => {
//       await PushNotifications.addListener('registration', (token) => {
//         console.log('Dummy push registration success, token: ' + token.value);
//         // Simulate a push notification
//         const notification = {
//           title: 'Dummy Push Notification',
//           body: 'This is a simulated push notification.',
//           id: new Date().getTime().toString(),
//           data: {
//             message: 'This is a simulated message',
//           },
//         };
//         PushNotifications.addListener('pushNotificationReceived', (notification) => {
//           alert('Push notification received: ' + JSON.stringify(notification));
//         });
//       });
//     };

//     const intervalId = setInterval(() => {
//       sendDummyNotification();
//     }, 10000); // Trigger every 10 seconds for demonstration

//     return () => clearInterval(intervalId); // Cleanup interval on component unmount
//   }, []);

//   return (
//   <></>
//   );
// };

// export default DummyPushNotification;
