import { ref, set } from "firebase/database";
import { database } from "../../utils/firebase";
import CryptoJS from 'crypto-js';


export async function createDorm(curreUserId: string, targetUserId: string) {
    const dormURI: string = 'dorm/' + curreUserId + '/' + targetUserId;
    const targetUserDORMURI: string = 'dorm/' + targetUserId + '/' + curreUserId;


    const rawRoomId =
        curreUserId < targetUserId
            ? `${curreUserId}.${targetUserId}`
            : `${targetUserId}.${curreUserId}`;

    const roomId = CryptoJS.SHA256(rawRoomId).toString();

    const dormData = {
        unread: 0,
        roomId,
    }

    const userDorm = set(ref(database, dormURI), dormData);
    const targetUserDorm = set(ref(database, targetUserDORMURI), dormData);

    await Promise.all([userDorm, targetUserDorm]);
}