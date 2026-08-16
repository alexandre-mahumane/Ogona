# Ogona Mobile

App Expo (React Native) — Expo Router + NativeWind (Tailwind) + Zod + View Components.

## Stack

| Camada | Tech |
|--------|------|
| Runtime | Expo SDK 57 · React Native 0.86 · React 19 |
| Navegação | Expo Router (file-based, typed routes) |
| Estilo | NativeWind v4 · Tailwind CSS 3 |
| Validação | Zod 3 · React Hook Form |
| Dados | TanStack Query · fetch client |
| Estado cliente | Zustand · SecureStore (JWT) |

## Arquitetura (View Components)

```
app/                  # Rotas finas — wiring (hooks, navegação, store)
src/
  views/              # Composições de ecrã (UI + layout)
  components/ui/      # Componentes reutilizáveis
  schemas/            # Schemas Zod
  stores/             # Estado global (Zustand)
  providers/          # QueryClient, hydration
  lib/api/            # Cliente HTTP (auth, discover, reservations, properties, …)
  lib/mappers/        # API → modelos de UI
  hooks/              # TanStack Query (guest + host)
  lib/storage/        # SecureStore
  theme/              # Tokens (cores)
```

**Regra:** `app/*` não contém layout visual pesado — só liga dados/ações a uma `*View`.

## Setup

```bash
cp .env.example .env
npm install
npm start
```

- `EXPO_PUBLIC_API_URL` aponta para o backend (`http://localhost:3000/api/v1`)
- No dispositivo físico, usa o IP da máquina em vez de `localhost`
- No emulador Android, usa `http://10.0.2.2:3000/api/v1`

### Dados demo

Com o backend a correr e após `npm run db:seed` na pasta `backend/`:

| Papel | Telefone | Password |
|-------|----------|----------|
| Hóspede | `841111111` | `senha12345` |
| Anfitrião | `842222222` | `senha12345` |

O login redireciona automaticamente conforme o `role` (guest → `/(guest)`, host → `/(host)`).

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm start` | Expo Dev Server |
| `npm run android` / `ios` / `web` | Plataforma |
| `npm run typecheck` | `tsc --noEmit` |

## Auth flows (Figma MVP V2)

| Fluxo | Rotas |
|-------|-------|
| Login | `/(auth)/login` |
| Registo hóspede | `register` → `register-verify` → `register-success` |
| Registo anfitrião | `register` → `register-wallet` → `register-verify` → `register-success` |
| Recuperar senha | `forgot-password` → `forgot-verify` → `reset-password` → `reset-success` |

Comunicações via **TanStack Query**:
- `useQuery` para GETs (`useMeQuery`, discover, reservas, dashboard, …)
- `useMutation` para POST/PUT/PATCH/DELETE (`useLoginMutation`, create, pay, …)
- Cliente HTTP em `src/lib/api/*`


Design tokens: primário `#FF6900`, tipografia Oxygen / Manrope / Inter.

