# Cloudflare Workers Subgraph Masking (`apps/api`)

API de enmascaramiento (**Reverse Proxy**) de alto rendimiento construida con [Hono](https://hono.dev/), **Axios** y TypeScript para Cloudflare Workers.

Enmascara de forma transparente y eficiente las llamadas GraphQL redirigiéndolas al Subgraph de Goldsky (`p2pme-subgraph`) simulando el origen `https://app.p2p.me`.

---

## 📌 Endpoints disponibles

Cualquier petición enviada a la raíz (`/`), `/graphql` o `/subgraph` se procesa directamente como consulta al Subgraph enmascarado.

| Método | Ruta | Descripción |
| --- | --- | --- |
| `ALL` | `/` | **Proxy GraphQL**: Enmascara peticiones al Subgraph de Goldsky |
| `ALL` | `/graphql` | **Alias Proxy GraphQL** |
| `ALL` | `/subgraph` | **Alias Proxy GraphQL** |

---

## 🚀 Ejemplo de Consulta GraphQL

Puedes hacer consultas directamente a la URL de tu Worker:

### POST `/` (o `/graphql` / `/subgraph`)

**Headers:**
```http
Content-Type: application/json
```

**Body:**
```json
{
  "query": "query { orders_collection(first: 5) { orderId status } }"
}
```

---

## 🛠️ Comandos de Desarrollo y Despliegue

```bash
# Iniciar servidor local de desarrollo
cmd /c pnpm --filter api dev

# Verificar tipos TypeScript
cmd /c pnpm --filter api check-types

# Desplegar a Cloudflare Workers
cmd /c pnpm --filter api deploy
```
