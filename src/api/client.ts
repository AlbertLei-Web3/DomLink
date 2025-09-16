import { BASE_DOMAIN_API_URL } from "@/config";
import axios from "axios";

export const apiClient = () => {
  return axios.create({
    baseURL: BASE_DOMAIN_API_URL,
    headers: {
      "Content-Type": "application/json",
      "Api-Key": import.meta.env.VITE_DOMA_API_KEY,
    },
  });
};
