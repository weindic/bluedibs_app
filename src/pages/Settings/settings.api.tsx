import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "../../utils/axios";

export const setUserInformationApi = ({ pan }: { pan: string }) => {
  return axiosInstance.post("user/personal-information", { pan });
};


export const getKYCStatus = (userId:any) => {
  return axiosInstance.get("/kyc-requests/user/"+userId);
};


export const createRefralCode = (data:any) => {
  return axiosInstance.post("referrals", data);
};
