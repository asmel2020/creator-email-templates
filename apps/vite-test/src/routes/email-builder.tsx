import { createFileRoute } from "@tanstack/react-router"
import { EmailBuilder, EmailBuilderProvider } from "@repo/create-email-template"
import "@repo/create-email-template/style.css"

export const Route = createFileRoute("/email-builder")({
  component: EmailBuilderPage,
})

function EmailBuilderPage() {
  return (
    <EmailBuilderProvider>
      <EmailBuilder />
    </EmailBuilderProvider>
  )
}
