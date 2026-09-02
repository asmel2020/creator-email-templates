import { useAuthStore } from "@/stores/auth-store"
import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().auth.accessToken

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
