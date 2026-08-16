# Ogona API

Backend MVP — Node + Express + TS + PostgreSQL + Drizzle + Redis + Zod + Docker (MVC + DTOs).

**Documentação para code review (decisões + lógica das rotas):** [`docs/GUIA-CODE-REVIEW.md`](./docs/GUIA-CODE-REVIEW.md)

## Setup

```bash
cp .env.example .env
docker compose up -d db redis
npm install
npm run db:migrate
npm run db:seed   # dados demo para o mobile
npm run dev
```

### Contas demo (após `db:seed`)

| Papel | Telefone | Password |
|-------|----------|----------|
| Hóspede | `841111111` | `senha12345` |
| Anfitrião | `842222222` | `senha12345` |

Cria 2 propriedades publicadas (Maputo + Beira), quartos, 1 reserva pendente e 1 favorito.
- Swagger UI: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- OpenAPI JSON: [http://localhost:3000/api/docs.json](http://localhost:3000/api/docs.json)
- Ping: `GET /ping` ou `GET /api/v1/health/ping`

## Testes

DB de testes: `ogona-test` (via `.env.test`).

```bash
npm run db:migrate:test
npm test
```

O ficheiro `tests/seed-demo.test.ts` valida o dataset demo (login, discover, favoritos, reservas, dashboard).

## Auth

| Rota | Nota |
|------|------|
| `POST /api/v1/auth/register/guest` | Hóspede |
| `POST /api/v1/auth/register/host` | Anfitrião |
| `POST /api/v1/auth/login` | phone + password |
| `GET /api/v1/auth/me` | JWT |
| `POST /api/v1/auth/password/*` | Forgot + OTP (Redis) |

## Host — Dashboard / Propriedades / Reservas / Calendário

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/v1/dashboard` | Métricas + pendentes + actividade |
| GET | `/api/v1/properties/catalogs` | Enums |
| POST | `/api/v1/properties` | Criar propriedade |
| GET | `/api/v1/properties?status=&search=` | Listar (filtros UI) |
| GET | `/api/v1/properties/:id` | Detalhe + stats + quartos |
| PATCH | `/api/v1/properties/:id` | Editar |
| PATCH | `/api/v1/properties/:id/status` | published/draft/hidden/under_review |
| DELETE | `/api/v1/properties/:id` | Eliminar |
| POST | `/api/v1/properties/:id/rooms` | Adicionar quarto |
| GET | `/api/v1/reservations?status=&search=` | Gestão de reservas |
| POST | `/api/v1/reservations/:id/accept` | Aceitar (+ pagamento stub) |
| POST | `/api/v1/reservations/:id/reject` | Rejeitar |
| GET | `/api/v1/rooms/:roomId/calendar?year=&month=` | Calendário |
| POST | `/api/v1/rooms/:roomId/calendar/block` | Bloquear datas |
| POST | `/api/v1/rooms/:roomId/calendar/unblock` | Desbloquear |
| POST | `/api/v1/rooms/:roomId/calendar/price` | Preço por data |
| POST | `/api/v1/rooms/:roomId/calendar/close-room` | Fechar quarto |

## Guest — Discover / Favoritos / Avaliações

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/v1/discover/home?lat=&lng=` | Perto de si + mais reservados + cidades |
| GET | `/api/v1/discover/properties?...` | Pesquisa + filtros (tipo, preço, rating, quartos, banheiros, parking) |
| GET | `/api/v1/discover/cities` | Explore por cidade |
| GET | `/api/v1/discover/properties/:id` | Detalhe público + quartos + rating |
| GET | `/api/v1/discover/properties/:id/reviews?rating=` | Avaliações + summary/breakdown |
| GET | `/api/v1/discover/rooms/:roomId` | Quarto público getById |
| GET/POST/DELETE | `/api/v1/discover/favorites...` | Favoritos (guest JWT) |
| POST | `/api/v1/reviews` | Escrever avaliação (hóspede verificado) |
