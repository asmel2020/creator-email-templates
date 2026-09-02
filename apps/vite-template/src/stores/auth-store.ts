import { create } from "zustand"
import { getCookie, removeCookie, setCookie } from "@/lib/cookies"
import decodeJwt from "@/lib/decode-jwt"

const ACCESS_TOKEN = "pv-token"

interface AuthUser {
  id: string
  name?: string
  email?: string
  avatar?: string
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    accessToken: string
    setAccessToken: (accessToken: string) => void
    resetAccessToken: () => void
    reset: () => void
  }
}

export const useAuthStore = create<AuthState>()((set) => {
  const cookieState = getCookie(ACCESS_TOKEN)
  const initToken = cookieState ? JSON.parse(cookieState) : ""
  const initUser = cookieState
    ? decodeJwt<AuthUser>(JSON.parse(cookieState))
    : null
  return {
    auth: {
      user: initUser,
      setUser: (user) =>
        set((state) => ({ ...state, auth: { ...state.auth, user } })),
      accessToken: initToken,
      setAccessToken: (accessToken) =>
        set((state) => {
          setCookie(ACCESS_TOKEN, JSON.stringify(accessToken))
          const user = decodeJwt<AuthUser>(accessToken)
          return { ...state, auth: { ...state.auth, accessToken, user } }
        }),
      resetAccessToken: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          return { ...state, auth: { ...state.auth, accessToken: "" } }
        }),
      reset: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          return {
            ...state,
            auth: { ...state.auth, user: null, accessToken: "" },
          }
        }),
    },
  }
})
