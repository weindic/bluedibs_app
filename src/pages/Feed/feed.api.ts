import { axiosInstance } from "../../utils/axios";

export function getFeed(page = 1) {
  return axiosInstance.get(`/user/feed?page=${page}`).then((res) => res.data);
}

export function likePost(postId: string) {
  return axiosInstance.post(`/user/like/${postId}`);
}

export function unLikePost(postId: string) {
  return axiosInstance.post(`/user/unlike/${postId}`);
}
