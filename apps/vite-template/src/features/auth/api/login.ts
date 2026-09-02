import { useMutation, type UseMutationOptions } from "@tanstack/react-query"
import api from "@/core/api"

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken?: string
  token?: string
  [key: string]: unknown
}

export const login = async (requestData: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/users/login", requestData)
  return response.data
}

export const useLoginMutation = (
  options?: UseMutationOptions<LoginResponse, Error, LoginRequest>
) => {
  return useMutation({
    mutationFn: login,
    ...options,
  })
}
