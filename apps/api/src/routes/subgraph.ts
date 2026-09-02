import { Hono } from 'hono'

export const DEFAULT_SUBGRAPH_URL =
  'https://api.goldsky.com/api/public/project_cmq7kbyqt81p501xi7h0wdeuh/subgraphs/p2pme-subgraph/prod/gn'
export const DEFAULT_FORWARD_ORIGIN = 'https://app.p2p.me'
export const DEFAULT_FORWARD_REFERER = 'https://app.p2p.me/'

type Env = {
  Bindings: {
    SUBGRAPH_URL?: string
    FORWARD_ORIGIN?: string
    FORWARD_REFERER?: string
  }
}

export const subgraphApp = new Hono<Env>()

// Proxy exclusivo para peticiones POST (todos los demás métodos responden 404 Not Found)
const proxyHandler = async (c: any) => {
  // Rechazar cualquier método que no sea POST
  if (c.req.method !== 'POST') {
    return c.text('Not Found', 404)
  }

  const targetUrl = c.env?.SUBGRAPH_URL || DEFAULT_SUBGRAPH_URL
  const forwardOrigin = c.env?.FORWARD_ORIGIN || DEFAULT_FORWARD_ORIGIN
  const forwardReferer = c.env?.FORWARD_REFERER || DEFAULT_FORWARD_REFERER

  const forwardHeaders = new Headers()

  // 1. Copiar encabezados entrantes normalizándolos a minúsculas
  c.req.raw.headers.forEach((value: string, key: string) => {
    const lowerKey = key.toLowerCase()
    if (
      lowerKey !== 'host' &&
      lowerKey !== 'origin' &&
      lowerKey !== 'referer' &&
      lowerKey !== 'content-length'
    ) {
      forwardHeaders.set(lowerKey, value)
    }
  })

  // 2. Garantizar content-type: application/json
  if (!forwardHeaders.has('content-type')) {
    forwardHeaders.set('content-type', 'application/json')
  }

  // 3. Forzar Origin y Referer con https://app.p2p.me
  forwardHeaders.set('origin', forwardOrigin)
  forwardHeaders.set('referer', forwardReferer)

  let bodyData: ArrayBuffer | string = '{}'

  try {
    const buffer = await c.req.raw.arrayBuffer()
    if (buffer && buffer.byteLength > 0) {
      bodyData = buffer
    } else {
      bodyData = JSON.stringify({ query: '' })
    }
  } catch {
    bodyData = JSON.stringify({ query: '' })
  }

  try {
    const upstreamResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: forwardHeaders,
      body: bodyData,
    })

    // 4. Copiar encabezados de respuesta deduplicados
    const responseHeaders = new Headers()
    upstreamResponse.headers.forEach((value: string, key: string) => {
      const lowerKey = key.toLowerCase()
      if (
        lowerKey !== 'transfer-encoding' &&
        lowerKey !== 'content-encoding' &&
        lowerKey !== 'access-control-allow-origin' &&
        lowerKey !== 'access-control-allow-headers' &&
        lowerKey !== 'access-control-allow-methods'
      ) {
        responseHeaders.set(lowerKey, value)
      }
    })

    const resBody = await upstreamResponse.arrayBuffer()

    return new Response(resBody, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders,
    })
  } catch (err: any) {
    console.error('[Subgraph Proxy Error]:', err)
    return c.json(
      {
        errors: [
          {
            message: 'Error de conexión con el Subgraph destino',
          },
        ],
      },
      502
    )
  }
}

subgraphApp.all('*', proxyHandler)
