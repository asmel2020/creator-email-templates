# Module `items`

## Responsibility

Full CRUD for the `item` entity. Items are scoped to the authenticated user (users can only see/edit their own items). Deletion requires ADMIN role.

## Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/items` | USER/ADMIN | List all items belonging to the authenticated user |
| `GET` | `/items/:id` | USER/ADMIN | Get a single item by ID |
| `POST` | `/items` | USER/ADMIN | Create a new item |
| `PUT` | `/items/:id` | USER/ADMIN | Update an existing item |
| `DELETE` | `/items/:id` | ADMIN | Delete an item |

## Module Pattern

### routes.ts
- Uses `Hono<ApiEnv>()` for typed context
- Each route: `auth()` (role check) → `validate()` (Zod) → `handle()` (response wrapper)
- Role scoping: `auth(["ADMIN"])` for delete, `auth(["ADMIN", "USER"])` for others
- User-scoped data: `req.raw.get("user").id` used to filter items by owner

### services.ts
- Imports `db()` from `@/shared/db`
- Uses Drizzle query builders: `select`, `insert`, `update`, `delete`
- Scopes queries by `userId` for data isolation
- Throws `HTTPException` for controlled errors (404)

### validate.ts
- `createItemSchema`: name required, description optional, status defaults to "active"
- `updateItemSchema`: all fields optional (partial update)
- Uses `ITEM_STATUSES` enum from the schema for type safety
