import { push, ref } from "firebase/database";
import { database } from "./firebase";
import { store } from "../store/store";


export function NotifyUser(userId: string, data: any) {
    const { user } = store.getState()
    const notificationRef = ref(database, `notifications/${userId}`);
    data.username = user.username
    data.unread = true;
    data.time = new Date().toISOString()
    push(notificationRef, data)
}