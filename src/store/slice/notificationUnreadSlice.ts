import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export const notificationUnreadSlice = createSlice({
    name: 'notifUnread',
    initialState: false,
    reducers: {
        setNotificationUnread(data, action: PayloadAction<boolean>) {
            data = action.payload
            return data
        }
    }
})

export const { setNotificationUnread } = notificationUnreadSlice.actions
export default notificationUnreadSlice.reducer