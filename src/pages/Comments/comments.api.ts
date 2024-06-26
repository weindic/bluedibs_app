import { axiosInstance } from "../../utils/axios";

export function getAllComments(postId: string) {
  return axiosInstance.get(`/comment/${postId}`).then((res) => res.data);
}

export function addComment(postId: string, content: string) {
  return axiosInstance.post(`/comment/${postId}`, { content });
}

export function deleteComment(commentId: string) {
  return axiosInstance.delete(`/comment/${commentId}`);
}
