import { axiosInstance } from "../../utils/axios";

export function getFeedsByUsername(username: string, page = 0) {
  return axiosInstance
    .get(`user/feeds/${username}?page=${page}`)
    .then((res) => res.data);
}
