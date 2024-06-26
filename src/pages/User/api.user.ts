import { axiosInstance } from "../../utils/axios";

export function fetchUserDetails(userId: string) {
    return axiosInstance.get(`/user/${userId}`).then(res => res.data)
}

export function followUser(userId: string) {
    return axiosInstance.post(`/user/follow/${userId}`)
}

export function unFollowUser(userId: string) {
    return axiosInstance.post(`/user/unfollow/${userId}`)
}