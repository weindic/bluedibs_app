import axios from "axios";
import { config } from "../config";
import { app } from "./firebase";
import { getAuth } from "firebase/auth";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";

export const axiosInstance = axios.create({
  baseURL: config.API_URL,
});

// // TO DO
axiosInstance.interceptors.request.use(async (config) => {
  try {
    const result = await FirebaseAuthentication.getIdToken();

    if (result.token) config.headers.Authorization = `Bearer ${result.token}`;
  } catch (err) {
    console.log(err);
  }
  return config;
});
