"use client";

import dynamic from "next/dynamic";

// El builder usa APIs de navegador (dnd-kit, blob URLs, contenteditable), así
// que lo cargamos solo en cliente.
const EmailBuilderApp = dynamic(
  () => import("@/components/email-builder-app"),
  { ssr: false },
);

export default function Home() {
  return <EmailBuilderApp />;
}
