import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// CSS del builder (autocontenido: fuente Geist inline, scope .ter-theme).
// Al importarlo en el layout raíz queda disponible en todas las rutas.
import "create-email-template/style.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Email Builder — Next.js example",
  description:
    "Ejemplo de integración de create-email-template (builder) y create-email-renderer (render server-side) en Next.js",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
