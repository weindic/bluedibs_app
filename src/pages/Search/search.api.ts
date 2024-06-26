import { axiosInstance } from "../../utils/axios";

export function searchUsername(query: string | null | undefined) {
  if (!query || query.length < 1) return [];
  return axiosInstance.get(`/user/search/${query}`).then((res) => res.data);
}

export function getSuggestedUsers() {
  return axiosInstance.get(`/user/suggestions/users`).then((res) => res.data);
}
