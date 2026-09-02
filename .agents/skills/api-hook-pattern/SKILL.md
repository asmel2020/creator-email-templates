---
name: api-hook-pattern
description: Modular API service and TanStack Query hook architecture for React feature modules. Use when implementing backend integration, creating API functions, TanStack Query hooks, query or mutation hooks, or structuring feature data fetching.
---

# API Hook Pattern Skill

This pattern defines the standard architecture for data fetching and backend integration within React features in this project. It decouples HTTP requests, TypeScript data models, state management (TanStack Query), and UI presentation into clean, modular layers.

---

## Directory Structure Standard

Every feature module requiring backend communication follows this directory layout under `src/features/<feature-name>/`:

```text
src/features/<feature-name>/
├── api/
│   ├── types.ts          # Request DTOs, Query Params, API Response interfaces
│   └── index.ts          # Pure async API fetcher/mutation functions (e.g., fetchFeatureFn)
├── hook/
│   └── use-<feature>.ts  # Custom TanStack Query hooks (useQuery / useMutation)
├── components/           # UI components for the feature
├── types/                # Domain or component types (optional)
└── index.tsx             # Main feature page component consuming the custom hook
```

---

## 1. API Types (`src/features/<feature-name>/api/types.ts`)

Define explicit TypeScript interfaces for query parameters, request payloads, and API wrapper responses.

```ts
// Request Parameters or Payloads
export interface GetFeatureParams {
  year: number
  month: number
  search?: string
}

// Standard API Response Wrapper
export interface ApiResponse<T> {
  success: boolean
  data: T
}

// Raw Item returned by Backend (before transformation)
export interface RawApiItem {
  id?: string
  fecha?: string
  date?: string
  colorHex?: string
  [key: string]: any
}
```

---

## 2. API Fetcher Functions (`src/features/<feature-name>/api/index.ts`)

Pure async functions that use `apiClient` (`@/lib/api-client`) to make HTTP calls. They handle response extraction and data normalization/mapping.

```ts
import apiClient from '@/lib/api-client'
import type { ApiResponse, GetFeatureParams, RawApiItem } from './types'

// GET Request (Query)
export async function fetchFeatureFn(
  params: GetFeatureParams
): Promise<RawApiItem[]> {
  const { data } = await apiClient.get<ApiResponse<RawApiItem[]>>(
    '/feature/endpoint',
    { params }
  )

  const items = data.data ?? []

  // Optional Response Normalization / Mapping
  return items.map((item) => ({
    ...item,
    date: item.date || item.fecha || '',
    colorHex: item.colorHex || '#00B0F0',
  }))
}

// POST / PUT Request (Mutation)
export async function createFeatureFn<TInput, TOutput>(
  payload: TInput
): Promise<TOutput> {
  const { data } = await apiClient.post<ApiResponse<TOutput>>(
    '/feature/endpoint',
    payload
  )
  return data.data
}
```

---

## 3. TanStack Query Custom Hooks (`src/features/<feature-name>/hook/use-<feature>.ts`)

Encapsulate `useQuery` or `useMutation` into reusable custom hooks with cache keys, stale time, and side effects.

### Query Hook Pattern (`useQuery`):

```ts
import { useQuery } from '@tanstack/react-query'
import { fetchFeatureFn } from '../api'
import type { GetFeatureParams } from '../api/types'

export const useFeatureQuery = (params: GetFeatureParams) => {
  return useQuery({
    queryKey: ['feature-key', params.year, params.month],
    queryFn: () => fetchFeatureFn(params),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    enabled: Boolean(params.year && params.month),
  })
}
```

### Mutation Hook Pattern (`useMutation`):

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { toast } from 'sonner'
import { createFeatureFn } from '../api'

export const useFeatureMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createFeatureFn,
    onSuccess: () => {
      toast.success('Operación realizada con éxito')
      // Invalidate relevant queries to refresh list automatically
      queryClient.invalidateQueries({ queryKey: ['feature-key'] })
    },
    onError: (error) => {
      if (error instanceof AxiosError && error.response?.data?.error?.message) {
        toast.error(error.response.data.error.message)
      } else {
        toast.error('Ocurrió un error. Por favor intenta de nuevo.')
      }
    },
  })
}
```

---

## 4. UI Component Integration (`src/features/<feature-name>/index.tsx`)

Features consume the custom query/mutation hook cleanly without needing direct `axios` or raw query logic.

```tsx
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useFeatureQuery } from './hook/use-feature'

export function FeaturePage() {
  const [params, setParams] = useState({ year: 2026, month: 1 })

  // Consume custom API hook
  const { data: items = [], isLoading, isError } = useFeatureQuery(params)

  if (isLoading) {
    return <Loader2 className="animate-spin" />
  }

  return (
    <div>
      {/* Feature UI rendering items */}
      <ul>
        {items.map((item, idx) => (
          <li key={item.id || idx}>{item.date}</li>
        ))}
      </ul>
    </div>
  )
}
```

---

## Key Guidelines & Best Practices

1. **Separation of Concerns**: Keep HTTP request definitions in `api/index.ts`, types in `api/types.ts`, and TanStack Query state in `hook/use-<feature>.ts`.
2. **Explicit Query Keys**: Use array-based structured query keys e.g. `['feature-name', param1, param2]`.
3. **Data Normalization**: Perform backend-to-frontend response mapping inside `api/index.ts` before returning data to the hook.
4. **Centralized HTTP Client**: Always use `@/lib/api-client` (which includes base URL and Bearer token interceptors).
