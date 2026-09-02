---
name: hono-openapi-docs
description: Modular OpenAPI documentation patterns for Hono using hono-openapi. Use when designing, modularizing, or decoupling Hono routes and endpoint schemas, or when asked to "modularize openapi", "decouple documentation", or "document hono endpoints".
---

# Modular Hono OpenAPI Documentation Pattern

Guideline for maintaining clean, modular, and decoupled OpenAPI documentation inside Hono project architectures using `hono-openapi` and Zod.

## Core Principles

1. **Decoupled Route Files**: The `example.routes.ts` file should ONLY contain route declarations, validators, and request/response orchestration. Avoid defining massive `describeRoute` objects inline inside the routes file.
2. **Dedicated `docs/` Subfolder**: For every bounded context module, create a `docs/` folder (e.g., `src/modules/<module-name>/docs/`).
3. **One File Per Endpoint Docs**: Place the OpenAPI metadata schema definition (`describeRoute`) for each endpoint in its own file inside the `docs/` folder.
4. **Zod Integration**: Define your schemas inside `domain/example.schemas.ts`, import them inside `docs/` to document the responses, and inside `presentation/example.routes.ts` to validate the inputs.

---

## Directory Structure Example

```
src/modules/example/
├── domain/
│   └── example.schemas.ts       # Zod schemas (input & output definitions)
├── presentation/
│   └── example.routes.ts        # Route handlers (references documentation files)
└── docs/
    ├── list-all.ts              # GET / endpoint docs
    ├── get-by-id.ts             # GET /:id endpoint docs
    └── create.ts                # POST / endpoint docs
```

---

## Implementation Reference

### 1. The Documentation File

Define route documentation metadata in `src/modules/example/docs/get-by-id.ts`:

```typescript
import { describeRoute } from "hono-openapi";

export const getExampleByIdDocs = describeRoute({
  description: "Retrieve a specific example entity by its unique ID",
  responses: {
    200: {
      description: "Example details",
    },
    404: {
      description: "Example not found error",
    },
  },
});
```

### 2. The Route Handler File

Import the metadata and apply the validator middleware in `src/modules/example/presentation/example.routes.ts`:

```typescript
import { Hono } from "hono";
import { validator } from "hono-openapi";
import type { AppEnv } from "@/config/env.js";
import {
  getExampleParamsSchema,
  type GetExampleParams,
} from "@/modules/example/domain/example.schemas.js";
import { getExampleByIdDocs } from "@/modules/example/docs/get-by-id.js";

const exampleRoutes = new Hono<AppEnv>();

exampleRoutes.get(
  "/:id",
  getExampleByIdDocs, // Decoupled OpenAPI Docs
  validator("param", getExampleParamsSchema), // Automatically registered in Spec
  async (c) => {
    const { id } = c.req.valid("param"); // Automatically typed
    const { getExample } = c.get("container").example;
    const result = await getExample.execute(id);

    if (!result.ok) {
      return c.json({ error: result.error.message }, 404);
    }
    return c.json(result.value);
  }
);
```

---

## Rules to Follow

- **Always use path aliases**: Import documents using the absolute alias `@/modules/...` instead of deep relative paths (`../../docs/...`).
- **Enforce ESM extensions**: Append `.js` to TypeScript file imports when running in strict ESM modules (e.g., `import { getExampleByIdDocs } from "@/modules/example/docs/get-by-id.js"`).
- **Type inference**: Do NOT manually type cast parameters when accessing `c.req.valid(...)` since the Hono standard validation middleware already types them correctly based on the passed Zod schema.
- **Never inline responses**: When writing new routes, extract the `describeRoute` logic into its corresponding `docs/` module file immediately.
