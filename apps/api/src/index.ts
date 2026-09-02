import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { subgraphApp } from './routes/subgraph'

type Bindings = {
  SUBGRAPH_URL?: string
  FORWARD_ORIGIN?: string
  FORWARD_REFERER?: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Middleware de Logger y CORS
app.use('*', logger())
app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposeHeaders: ['Content-Length', 'Content-Type'],
    maxAge: 86400,
  })
)

// Montar el Subgraph Proxy exclusivamente en POST
app.route('/subgraph', subgraphApp)
app.route('/graphql', subgraphApp)
app.route('/', subgraphApp)

// 404 Handler
app.notFound((c) => {
  return c.text('Not Found', 404)
})

// Global Error Handler
app.onError((err, c) => {
  console.error(`[Internal Server Error] ${err.message}`, err)
  return c.text('Not Found', 404)
})

export default app
