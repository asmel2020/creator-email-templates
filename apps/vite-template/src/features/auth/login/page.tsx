import { LoginForm } from "./components/login-form"
import { useSearch } from "@tanstack/react-router"
export default function LoginPage() {
  // TypeScript sabe que `search.redirect` es string | undefined
  const { redirect } = useSearch({ from: "/(auth)/login" })

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <LoginForm redirect={redirect} />
      </div>
    </div>
  )
}

