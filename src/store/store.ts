import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./slice/userSlice";

import notificationSlice from "./slice/notificationSlice";
import notificationUnreadSlice from "./slice/notificationUnreadSlice";
import feedsPreferenceSlice from "./slice/feedsPrefrenceSlice";
import dormSlice from "./slice/dormSlice";

export const store = configureStore({
  devTools: true,
  reducer: {
    user: userSlice,
    notifications: notificationSlice,
    NotificationUnread: notificationUnreadSlice,
    feedsPreference: feedsPreferenceSlice,
    dorm: dormSlice
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
