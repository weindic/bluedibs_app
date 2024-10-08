import { z } from 'zod';
import { axiosInstance } from '../../utils/axios';

export const multipleProfileDTO = z.array(z.string());

export function getProfiles(body: z.infer<typeof multipleProfileDTO>) {
  return axiosInstance.post('/user/profiles', body).then((res) => res.data);
}

// export function startLiveChat(body:any) {
//   return axiosInstance.patch('/vip-chat-room/startChatRoom', body).then((res) => res.data);
// }
