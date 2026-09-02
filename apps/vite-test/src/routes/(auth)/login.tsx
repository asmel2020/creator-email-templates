import LoginPage from "@/features/auth/login/page"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

// 1. Defines el schema para los search params esperados
const loginSearchSchema = z.object({
  redirect: z.string().optional().catch("/"),
})

// 2. Pasas validateSearch a createFileRoute
export const Route = createFileRoute("/(auth)/login")({
  validateSearch: (search) => loginSearchSchema.parse(search),
  component: LoginPage,
})
