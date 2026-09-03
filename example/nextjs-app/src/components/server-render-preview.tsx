"use client";

import { useCallback, useEffect, useState } from "react";
import { useEmailBuilderConfig, useRenderEmail } from "create-email-template";

type Status = "idle" | "loading" | "ok" | "error";

/**
 * Prueba de round-trip del render en servidor:
 *
 *   editor (getPayload) ──POST /api/render──▶ create-email-renderer
 *          ▲                                        │
 *          └────────── iframe (srcDoc) ◀── { html } ┘
 *
 * Botón flotante que envía el JSON actual del editor al endpoint server-side
 * de esta app y muestra el HTML email-safe devuelto en un iframe. Así se ve
 * que el render en servidor funciona con el payload real del builder (y no
 * con el preview React del cliente).
 */
export function ServerRenderPreview() {
  const { getPayload } = useRenderEmail();
  const config = useEmailBuilderConfig();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [html, setHtml] = useState("");
  const [subject, setSubject] = useState("");
  const [error, setError] = useState("");

  const close = useCallback(() => setOpen(false), []);

  // Cierra con Escape (el iframe atrapa el foco, así que escucho en window)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  const testServerRender = useCallback(async () => {
    setOpen(true);
    setStatus("loading");
    setError("");
    try {
      const payload = getPayload();
      const res = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: "Prueba de render server-side, {firstName}",
          payload,
          context: config.sampleContext,
        }),
      });
      const data = (await res.json()) as {
        html?: string;
        subject?: string;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setHtml(data.html ?? "");
      setSubject(data.subject ?? "");
      setStatus("ok");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus("error");
    }
  }, [getPayload, config.sampleContext]);

  return (
    <>
      <button
        type="button"
        onClick={testServerRender}
        style={{
          position: "fixed",
          top: 16,
          right: 16,
          zIndex: 9999,
          padding: "10px 16px",
          borderRadius: 8,
          border: "1px solid #0d0b08",
          background: "#d7b227",
          color: "#0d0b08",
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
          fontFamily: "inherit",
        }}
      >
        ⚡ Render en servidor
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div
            style={{
              width: "min(720px, 100%)",
              height: "min(85vh, 900px)",
              background: "#fff",
              borderRadius: 12,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "0 8px 40px rgba(0,0,0,0.35)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                borderBottom: "1px solid #e5e5e5",
              }}
            >
              <strong style={{ fontSize: 14 }}>
                Render en servidor (create-email-renderer)
              </strong>
              {status === "loading" && <span style={{ fontSize: 13 }}>Cargando…</span>}
              {status === "ok" && (
                <span style={{ fontSize: 13, color: "#0a7d33" }}>
                  ✓ Asunto: {subject} · HTML: {(html.length / 1024).toFixed(1)} kB
                </span>
              )}
              {status === "error" && (
                <span style={{ fontSize: 13, color: "#c0392b" }}>✗ {error}</span>
              )}
              <button
                type="button"
                onClick={close}
                style={{
                  marginLeft: "auto",
                  border: "none",
                  background: "transparent",
                  fontSize: 18,
                  cursor: "pointer",
                  lineHeight: 1,
                }}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
            {status === "ok" ? (
              <iframe
                title="HTML renderizado en el servidor"
                srcDoc={html}
                style={{ flex: 1, border: "none", background: "#f5f1e8" }}
              />
            ) : (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#777",
                  fontSize: 14,
                  padding: 24,
                  textAlign: "center",
                }}
              >
                {status === "loading"
                  ? "Enviando el JSON del editor a /api/render…"
                  : "No se pudo renderizar en el servidor. Añade bloques al lienzo e inténtalo de nuevo."}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
