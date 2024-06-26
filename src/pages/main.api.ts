import { axiosInstance } from "../utils/axios";

export function getUserDetails() {
  return axiosInstance.get(`/user`).then((res) => res.data);
}

export function addPost(
  id: string,
  body: { url: string; caption?: string; mimetype: string },
  progressFn?: (progress: number) => void
) {
  return axiosInstance.post(`/post/${id}`, body, {
    onUploadProgress(progressEvent) {
      progressFn?.(
        Math.abs(Math.floor((progressEvent.progress ?? 0) * 100)) / 2
      );
    },
  });
}
