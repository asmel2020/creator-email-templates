import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"
import { AxiosError } from "axios"
import { RouterProvider, createRouter } from "@tanstack/react-router"
import { routeTree } from "@/routeTree.gen"
import { ThemeProvider } from "@/components/theme-provider.tsx"

import { useAuthStore } from "./stores/auth-store"
import { toast, Toaster } from "./components/ui/toast.tsx"
import { TooltipProvider } from "./components/ui/tooltip.tsx"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (import.meta.env.DEV) console.log({ failureCount, error })

        if (failureCount >= 0 && import.meta.env.DEV) return false
        if (failureCount > 3 && import.meta.env.PROD) return false

        return !(
          error instanceof AxiosError &&
          [401, 403].includes(error.response?.status ?? 0)
        )
      },
      refetchOnWindowFocus: import.meta.env.PROD,
      staleTime: 10 * 1000, // 10s
    },
    mutations: {
      onError: (error) => {
        if (error instanceof AxiosError) {
          if (error.response?.status === 304) {
            toast.add({
              type: "error",
              title: "Content not modified!",
            })
          }
        }
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          toast.add({
            type: "error",
            title: "Session expired!",
            description: "You are not authorized to access this resource",
          })
          useAuthStore.getState().auth.reset()
          const redirect = `${router.history.location.href}`
          router.navigate({ to: "/login", search: { redirect } })
        }
        if (error.response?.status === 500) {
          toast.add({
            type: "error",
            title: "Internal Server Error!",
            description: "Something went wrong, please try again later",
          })

          if (import.meta.env.PROD) {
            router.navigate({ to: "/500" })
          }
        }
        if (error.response?.status === 403) {
          router.navigate({ to: "/403", replace: true })
        }
      }
    },
  }),
})
// Create a new router instance
const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
})

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById("root")!

if (!rootElement.innerHTML) {
  const root = createRoot(rootElement)

  root.render(
    <StrictMode>
      <ThemeProvider>
        <TooltipProvider>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
            <Toaster />
          </QueryClientProvider>
        </TooltipProvider>
      </ThemeProvider>
    </StrictMode>
  )
}
