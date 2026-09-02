import EmailBuilderPage from "@/features/email-builder/page"
import { createFileRoute } from "@tanstack/react-router"
import "@repo/create-email-template/style.css"

export const Route = createFileRoute("/email-builder")({
  component: EmailBuilderPage,
})
