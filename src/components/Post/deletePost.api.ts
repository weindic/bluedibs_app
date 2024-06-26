import { axiosInstance } from "../../utils/axios";

export function deletePost(postId: string) {
  return axiosInstance.delete(`/post/${postId}`);
}
