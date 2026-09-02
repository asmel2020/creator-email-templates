import { createFileRoute, redirect } from "@tanstack/react-router"
import { useAuthStore } from "@/stores/auth-store"

export const Route = createFileRoute("/(auth)")({
  beforeLoad: () => {
    const { auth } = useAuthStore.getState()

    if (auth.accessToken) {
      throw redirect({
        to: "/",
      })
    }
  },
})
