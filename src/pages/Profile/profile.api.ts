import { axiosInstance } from "../../utils/axios";
import { updateProfileSchema } from "./profile.schema";

export function updateProfile(body: Zod.infer<typeof updateProfileSchema>) {
  return axiosInstance.post(`/user/update-profile`, body, {
    headers: { "Content-Type": "application/json" },
  });
}


export function verfyRefferalCode(body:any) {
  return axiosInstance.post(`/referrals/verify`, body, {
    headers: { "Content-Type": "application/json" },
  });
}


export function fetchPosts(id: string, page = 0) {
  return axiosInstance.get(`/post/${id}?page=${page}`).then((res) => res.data);
}