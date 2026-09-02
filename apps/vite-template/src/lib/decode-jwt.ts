function toBase64Url(value: string): string {
  return btoa(unescape(encodeURIComponent(value)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
}

export function generateMockJwt<T extends object = Record<string, unknown>>(
  payload: T = { id: "1", email: "user@example.com", name: "Dev User" } as unknown as T
): string {
  const header = { alg: "HS256", typ: "JWT" }
  const headerEncoded = toBase64Url(JSON.stringify(header))
  const payloadEncoded = toBase64Url(JSON.stringify(payload))
  const signatureEncoded = toBase64Url("mock-signature-for-development")

  return `${headerEncoded}.${payloadEncoded}.${signatureEncoded}`
}

function decodeJwt<T = unknown>(token: string): T {
  const parts = token.split(".")
  if (parts.length !== 3) throw new Error("Token JWT inválido")

  const payloadB64Url = parts[1]
  const payloadB64 = payloadB64Url.replace(/-/g, "+").replace(/_/g, "/")

  const jsonStr = decodeURIComponent(escape(atob(payloadB64)))
  return JSON.parse(jsonStr) as T
}

export default decodeJwt

