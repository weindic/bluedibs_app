import { axiosInstance } from "../../utils/axios";

export async function withdrawalAPI(body: { amount: number }) {
  return axiosInstance.post("withdrawal", body).then((res) => res.data);
}
