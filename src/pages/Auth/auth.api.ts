import { z } from "zod";
import { axiosInstance } from "../../utils/axios";
import { signupSchema } from "./schemas";

export const createUser = (body: z.infer<typeof signupSchema>) =>
  axiosInstance.post("/signup-request/create-profile", body);

export const signupValidationAPI = (body: any) =>
  axiosInstance.post(`/signup_validation`, body).then((res) => res.data);

export const updateNotifData = (body: {
}) => axiosInstance.post("/notification-alerts/update-user-id", body).then((res) => res.data);


export const sendPasswordResetOTPEmail = (body: {
}) => axiosInstance.post("/forgot-otp/send-otp", body).then((res) => res.data);

export const verifyForgottOtpAPI = (body: {
}) => axiosInstance.post("/forgot-otp/verify-otp", body).then((res) => res.data);


export const signupRequest = (body: {
}) => axiosInstance.post("/signup-request/newRequest", body).then((res) => res.data);


export const setupAPI = (body: {
  shares_dilute: number;
  equity_shares: number;
}) => axiosInstance.post("/user/setup", body).then((res) => res.data);

export const verifyOtpAPI = (body: { otp: string; email: string }) =>
  axiosInstance.post("/signup-request/verify-otp", body).then((res) => res.data);

export const sendOtpAPI = (body: { email: string }) =>
  axiosInstance.post("/signup-request/update-otp", body).then((res) => res.data);
