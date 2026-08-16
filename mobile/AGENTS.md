# Architecture notes for agents

- Expo SDK docs: https://docs.expo.dev/versions/v57.0.0/
- Keep `app/` routes thin — render `src/views/*` only
- Style with NativeWind `className` (Tailwind); tokens in `tailwind.config.js` + `src/theme`
- Validate forms/API payloads with Zod schemas in `src/schemas`
- **TanStack Query pattern (obrigatório):**
  - `useQuery` → GET / leituras (`src/hooks/useDiscover`, `useReservations`, `useHost`, `useMeQuery`)
  - `useMutation` → POST / PUT / PATCH / DELETE (`useAuth`, create/pay/cancel, etc.)
  - API pura em `src/lib/api/*` (sem React); hooks em `src/hooks/*`
- Auth: token no Zustand/SecureStore; perfil via `useMeQuery` (não fetch manual no store)
