import { axiosInstance } from "../../utils/axios";

export function getHoldings() {
  return axiosInstance.get("/user/wallet").then((res) => res.data);
}

export function getPaymentMethod() {
  const usr:any = localStorage.getItem('bluedibs:user')
  const user = JSON.parse(usr)
  return axiosInstance.get("/paymentmethods/getPaymentData/"+user.id).then((res) => res.data);
}


export function getUserReffById(userId:any) {
  return axiosInstance.get(`/referral-wallets/${userId}`).then((res) => res.data);
}


export function getReffCountData(data:any) {
  return axiosInstance.post(`/referrals/count`, data).then((res) => res.data);
}


export function addPaymentMethod(body:any) {
  return axiosInstance.post("/paymentmethods", body).then((res) => res.data);
}
