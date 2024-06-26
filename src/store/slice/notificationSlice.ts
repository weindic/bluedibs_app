import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

export interface Notification {
  unread: boolean;
  message: string;
  username: string;
  time: string;
  relativeHref: string;
  payload: string;
}

export const notificationsSlice = createSlice({
  name: "notifications",
  initialState: [] as Notification[],
  reducers: {
    setNotifications(notifications, action: PayloadAction<Notification[]>) {
      notifications = action.payload;
      return notifications;
    },
    addNotification(notifications, action: PayloadAction<Notification>) {
      notifications.push(action.payload);
      return notifications;
    },
  },
});

export const { setNotifications, addNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;
