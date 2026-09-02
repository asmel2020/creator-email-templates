# Módulo `auth`

## Responsabilidad

Autenticación de usuarios mediante email/contraseña y obtención del perfil del usuario autenticado.

## Archivos del módulo

```
auth/
├── routes.ts           # Definición de rutas HTTP
├── services.ts         # Lógica de negocio (login, JWT)
├── validate.ts         # Schemas Zod de validación
├── docs/
│   └── login-docs.ts   # Documentación OpenAPI del endpoint
└── README.md
```

## Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `POST` | `/auth/login` | ❌ | Login con email + password, devuelve JWT |
| `GET` | `/auth/me` | ✅ ADMIN/USER | Devuelve el perfil del usuario autenticado |

## Patrón del módulo

### routes.ts
- Usa `Hono<ApiEnv>()` para tipar el contexto con las variables de entorno y el `RequestUser`
- Cada ruta se registra con: `validate()` (Zod), `handle()` (wrapper de respuesta), y opcionalmente `auth()` (middleware)
- Las rutas auth NO usan `auth` middleware global; cada ruta decide si lo necesita (solo `/me` lo usa)

### services.ts
- Importa `db()` de `@/shared/db` para acceder a D1
- Usa `encodeJWT`/`decodeJWT` de `@/shared/lib/jwt` para manejo de tokens
- Lanza `HTTPException` de Hono para errores controlados

### validate.ts
- Schemas con `z.object()` y mensajes de error personalizados
- Se exporta el type inferido `LoginInput` para tipado en routes/services

## Para agregar un nuevo endpoint

1. **Si necesita validación**: agregar schema en `validate.ts` y exportar su type
2. **Si necesita documentación OpenAPI**: crear archivo en `docs/` con `describeRoute`
3. **Agregar lógica**: crear función en `services.ts` o un helper en `helpers/`
4. **Registrar ruta**: en `routes.ts` con el patrón:
   ```ts
   authRoutes.get("/mi-ruta", miDocs, handle(async (...) => { ... }));
   ```
5. **Auth**: si necesita autenticación, colocar `auth(["ADMIN", "USER"])` en la ruta o usar `raw.get("user")` dentro del handler
6. **Registrar**: el módulo ya se monta en `src/index.ts` como `v1.route("/auth", authRoutes)` — si creas un módulo nuevo, debes agregarlo ahí
