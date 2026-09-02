import SignupPage from "@/features/auth/sign-up/page"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

// 1. Defines el schema para los search params esperados
const signupSearchSchema = z.object({
  redirect: z.string().optional().catch("/"),
})

export const Route = createFileRoute("/(auth)/sign-up")({
  validateSearch: signupSearchSchema,
  component: SignupPage,
})
