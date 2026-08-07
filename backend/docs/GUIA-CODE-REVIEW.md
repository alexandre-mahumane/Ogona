# Ogona API — Guia para Code Review

Documento único para ler com calma: o que foi feito, **porquê**, e a lógica de cada área da API.

> Stack: Node 20+ · Express 5 · TypeScript · PostgreSQL · Drizzle ORM · Redis · Zod · Vitest  
> Prefixo da API: `/api/v1`  
> Docs interactivas: `/api/docs` · Ping: `/ping`

---

## 1. Contexto do produto

Ogona é um MVP de **alojamentos em Moçambique**. A API serve dois papéis distintos:

| Papel | Quem é | O que faz |
|-------|--------|-----------|
| **guest** (hóspede) | Utilizador que reserva | Explorar, favoritar, pedir reserva, pagar, avaliar |
| **host** (anfitrião) | Dono do alojamento | Gerir propriedades/quartos, calendário, aceitar/rejeitar pedidos |

**Moeda:** Metical (`MZN` / “MT” na UI).  
**Contacto do host:** `whatsapp` / `contactPhone` na propriedade (botão “Contactar anfitrião” no app).

A UI (Figma) ditou estados de reserva, modalidades (hora/noite/mês), Taxa Ogona 3.3%, M-Pesa/e-Mola e destinos populares. O backend modela isso de forma explícita, em vez de “inventar” um fluxo genérico tipo Airbnb só com noites.

---

## 2. Arquitectura — porquê esta estrutura

Fluxo de um pedido:

```
HTTP → Route → Middleware (auth / role / Zod) → Controller → Service → Repository → PostgreSQL / Redis
```

| Camada | Responsabilidade | Porquê |
|--------|------------------|--------|
| **Routes** | Só wiring HTTP + middlewares | Rotas legíveis; fácil ver quem pode chamar o quê |
| **Controllers** | Traduzem `req`/`res` | Controllers finos = lógica de negócio testável fora do Express |
| **Services** | Regras de negócio | Um sítio para “pode cancelar?”, “calcula taxa”, “expira pagamento” |
| **Repositories** | SQL via Drizzle | Isola ORM; services não espalham queries |
| **DTOs (Zod)** | Validação de entrada | Contrato na fronteira; erros 400 claros antes de tocar na BD |
| **Schema Drizzle** | Tabelas + enums PG | Source of truth do modelo; migrações geradas |

**Decisão consciente:** não usámos NestJS (menos overhead no MVP). Express + pastas MVC-ish dá controlo e velocidade para um time pequeno.

**Express 5:** o `req.query` é read-only. O middleware `validate` reescreve query com `Object.defineProperty` — sem isso, validação Zod de query partia.

---

## 3. Autenticação e perfil

### 3.1 Login por telefone (não email)

Em Moçambique o telefone é o identificador natural (M-Pesa, WhatsApp).  
**Decisão:** `phone` único, normalizado para E.164 (`+258…`). Email é opcional no perfil.

### 3.2 Dois registos separados

- `POST /auth/register/guest`
- `POST /auth/register/host`

**Porquê:** roles mutuamente exclusivos no MVP. Evita um user “ser os dois” e misturar permissões. `requireHost` / `requireRole('guest')` ficam simples.

### 3.3 JWT

Após registo/login/reset: JWT com `sub`, `phone`, `role`.  
Header: `Authorization: Bearer <token>`.

**Porquê JWT e não sessão server-side:** API mobile-first; stateless escala melhor; Redis fica para OTP, não para sessão.

### 3.4 Recuperação de senha com OTP

Fluxo:

1. `POST /auth/password/forgot` — confirma que o número existe (sem revelar demais além do necessário)
2. `POST /auth/password/send-otp` — gera código 4 dígitos, guarda no **Redis** (TTL 5 min, máx. 5 tentativas)
3. `POST /auth/password/verify-otp` — valida código → emite `resetToken` (UUID, TTL 15 min)
4. `POST /auth/password/reset` — nova senha + devolve JWT

**Porquê Redis:** OTP é efémero; não polui a tabela `users`.  
**Porquê stub SMS/WhatsApp:** no MVP só se faz `console.log` em dev; a interface `notificationService` permite plugar Twilio/etc. depois sem mudar rotas.

### 3.5 Foto de perfil

Campo `users.photo_url` + `PATCH /auth/me` com `photoUrl` (URL).  
**Porquê URL e não upload multipart:** o app pode usar CDN/S3 no cliente; a API só guarda a referência. Simplifica o backend no MVP.

### Rotas Auth (resumo)

| Método | Rota | Auth | Lógica |
|--------|------|------|--------|
| POST | `/auth/register/guest` | — | Cria user role=guest + JWT |
| POST | `/auth/register/host` | — | Idem host |
| POST | `/auth/login` | — | phone+password → JWT |
| GET | `/auth/me` | JWT | Perfil público (incl. photoUrl) |
| PATCH | `/auth/me` | JWT | name / email / photoUrl |
| POST | `/auth/password/*` | — | Fluxo OTP acima |

---

## 4. Modelo de domínio (o que existe na BD)

### 4.1 Propriedade e quarto

Uma **property** tem vários **rooms**.  
Só propriedades `published` aparecem no discover do hóspede.

**Status da propriedade:** `draft` | `published` | `hidden` | `under_review`  
Alinha com tabs da UI do host (rascunho / publicadas / ocultas / em revisão).

**Quarto** tem:

- tipo (`suite`, `twin`, …), capacidade, `bedLabel` (ex.: “1 cama king”)
- **preços por modalidade** na tabela `room_prices` (não um único preço)
- `min_units` / `max_units` por modalidade (limites do ecrã “Por Hora / Por Noite / Por Mês”)
- amenities + imagens (URLs, máx. 10)

**Porquê preço por modalidade:** a UI mostra “Noite · 3200 MT”, “Hora · 600 MT”, “Mês · 65 000 MT” no mesmo quarto. Um só `price_per_night` não chega.

### 4.2 Enums de localização

Províncias e “comunidades” (Polana, Tofo, Pemba, …) são enums PostgreSQL.  
**Porquê:** dados de referência estáveis para filtros/UX MZ; `outra` cobre o resto. Cidade/bairro continuam texto livre onde faz sentido.

### 4.3 Favoritos, reviews, actividades

- **favorites:** guest ↔ property
- **reviews:** só depois de reserva `confirmed` ou `completed` (hóspede verificado)
- **activities:** feed do dashboard do host (nova reserva, pagamento, review, …)

---

## 5. Fluxo de reserva (o coração do MVP)

Desenhado a partir dos ecrãs: selecionar quarto → modalidade → formulário → pending → host aceita → aguardar pagamento → pagar → confirmada.

```
guest: quote → create (pending)
         ↓
host:  accept → awaiting_payment (+ 24h para pagar)
         ↓
guest: pay (m_pesa | e_mola) → confirmed
```

Desvios: `reject`, `cancel`, expiração do prazo de pagamento → `cancelled`.

### 5.1 Porquê `awaiting_payment` e não confirmar no accept?

Na UI, depois do host aprovar, o hóspede vê “Reserva aprovada — aguardando pagamento” e um timer (“Expira em 23h…”).  
**Decisão:** accept **não** marca como paga. Cria pagamento `pending` e `payment_expires_at = now + 24h`. Só `POST .../pay` passa a `confirmed` + payment `paid`.

Isto evita o anti-padrão “aceitar = já está pago” (comum em stubs demasiado simplistas).

### 5.2 Quote vs Create

| | Quote | Create |
|---|--------|--------|
| Rota | `POST /reservations/quote` | `POST /reservations` |
| Persistência | Não | Sim (`pending`) |
| Objectivo | Ecrã “Cálculo do Preço” / “Ver resumo” | Pedido real ao host |

Ambos partilham a mesma função interna `buildQuote` para **não haver divergência** entre o que o user viu e o que foi gravado.

### 5.3 Unidades (`units`) em vez de só check-in/check-out

O formulário pede “quantidade de horas/noites/meses”, não necessariamente um date-range livre.

- Client envia: `modality`, `checkInDate`, `units`, e `startTime` se for `hora`
- Server calcula `checkOutDate` e, para hora, `estimatedEndTime` (“Saída estimada: 12:00”)

**Limites por defeito** (UI; podem ser override em `room_prices`):

| Modalidade | Min | Max | Notas |
|------------|-----|-----|--------|
| hora | 2 | 12 | `startTime` obrigatório |
| noite | 1 | 30 | |
| semana | 1 | 12 | |
| mes | 1 | 12 | ~30 dias/unidade |

### 5.4 Taxa Ogona 3.3%

```
subtotal = unitPrice × units
feeAmount = round(subtotal × 3.3 / 100)   // meticais inteiros (UI mostra 317 MT)
total = subtotal + feeAmount
```

**Porquê arredondar ao metical:** o ecrã Figma mostra inteiros (9600 + 317 = 9917). Guardamos também `fee_percent`, `fee_amount`, `subtotal_amount` para auditoria e para o footer “Total a pagar” vs “Total” do quarto.

### 5.5 Overlap e calendário

Uma reserva activa (`pending` | `awaiting_payment` | `confirmed`) no mesmo quarto bloqueia datas com intervalo **meio-aberto**:

`checkIn < other.checkOut AND checkOut > other.checkIn`

Também se rejeita se existir dia `blocked` no calendário do quarto nesse intervalo.

**Porquê incluir `awaiting_payment` no overlap:** o quarto já está “prometido” ao hóspede que tem prazo para pagar; senão dois guests pagavam o mesmo período.

### 5.6 Pagamento stub (M-Pesa / e-Mola)

`POST /reservations/:id/pay` com `{ method: "m_pesa" | "e_mola" }`.

Não há integração real com Vodacom/Millennium — só estado local.  
**Porquê:** desbloqueia o fluxo mobile e o code review do domínio; gateway entra numa fase seguinte sem mudar o contrato da rota.

### 5.7 Rotas de reserva

| Método | Rota | Quem | Lógica |
|--------|------|------|--------|
| POST | `/reservations/quote` | guest | Preço + fee + checkout estimado |
| POST | `/reservations` | guest | Cria `pending` + actividade host |
| GET | `/reservations/mine` | guest | “Minhas Reservas” + filtro status |
| GET | `/reservations/mine/:id` | guest | Detalhe (+ whatsapp host) |
| POST | `/reservations/:id/pay` | guest | Stub pagamento → `confirmed` |
| POST | `/reservations/:id/cancel` | guest | pending / awaiting_payment / confirmed |
| GET | `/reservations` | host | Lista + search nome/propriedade |
| GET | `/reservations/:id` | host | Detalhe |
| POST | `/reservations/:id/accept` | host | → awaiting_payment + 24h |
| POST | `/reservations/:id/reject` | host | → rejected |

`displayStatus` no mapper acrescenta UX do host (`check_in_today`, `in_stay`, …) sem alterar o status persistido.

---

## 6. Discover (lado hóspede)

Rotas públicas (ou JWT opcional) para explorar sem forçar login cedo.

| Rota | Porquê existe |
|------|----------------|
| `GET /discover/home` | Home: perto de si (lat/lng) + mais reservados + cidades |
| `GET /discover/properties` | Pesquisa + filtros (tipo, preço, rating, quartos, WC, parking) |
| `GET /discover/cities` | Explore por cidade (agregação real da BD) |
| `GET /discover/popular-destinations` | Grid fixo da UI (Maputo, Beira, Nampula, Pemba, Inhambane, Tete) enriquecido com contagens |
| `GET /discover/properties/:id` | Detalhe + quartos resumidos + rating + isFavorite |
| `GET /discover/rooms/:roomId` | Ecrã “selecionar quarto” / preços por modalidade |
| `GET .../reviews` | Lista + breakdown de estrelas |
| Favoritos | Só guest autenticado |

**Porquê destinos populares “hardcoded” + contagem live:** a UI mostra sempre as mesmas 6 cidades; a BD diz quantas propriedades há em cada uma. Evita um admin CMS só para isso no MVP.

**JWT opcional (`optionalAuth`):** se o user estiver logado, cards podem trazer `isFavorite` sem exigir login para navegar.

---

## 7. Host — propriedades, quartos, calendário, dashboard

### 7.1 Propriedades

CRUD + mudança de status. Default ao criar: `draft` (não aparece no discover até publicar).

`GET /properties/catalogs` devolve enums para popular dropdowns do app (províncias, tipos, amenities, …) — **uma fonte de verdade** partilhada com o schema.

### 7.2 Quartos

Criados sob `POST /properties/:id/rooms` com modalities + prices + amenities + images.  
Sem PATCH de quarto no MVP (criar + fechar via calendário/`indisponivel` cobre o essencial).

### 7.3 Calendário

`/rooms/:roomId/calendar`:

- ver mês (bloqueios, price override, marcas de reserva)
- block / unblock ranges
- price override por dia
- close-room → `indisponivel`

**Porquê separado de reservations:** o host gere inventário (manutenção, preços especiais) independentemente dos pedidos dos guests.

### 7.4 Dashboard

`GET /dashboard`: receita do mês, tendência vs mês anterior, pendentes, ocupação, check-ins/outs hoje, cards de pedidos, feed de actividades.

**Porquê activities table:** histórico leve para a UI “actividade recente” sem parsing de logs.

---

## 8. System, health, Swagger

| Rota | Função |
|------|--------|
| `GET /ping` | Liveness puro (sem DB) — load balancers / smoke |
| `GET /api/v1/health` | DB + Redis (pode 503 se degradado) |
| `GET /api/v1/health/ping` | Alias de pong |
| `/api/docs` | Swagger UI |
| `/api/docs.json` | Spec OpenAPI 3 |

Helmet com CSP desligado no MVP para o Swagger UI carregar assets sem dor. Em produção pode-se apertar.

---

## 9. Validações, erros e envelope de response

**Envelope de sucesso:**

```json
{ "success": true, "data": { ... } }
```

**Erros:** middleware central (`AppError` → 400/401/403/404/409/500) com mensagem em português (pt-MZ), alinhada à UI.

Zod nas entradas: datas `YYYY-MM-DD`, dinheiro positivo, UUIDs, enums fechados.  
Birth date no registo: `DD/MM/YYYY` (formato local) → convertido no DTO.

---

## 10. Infra, env e testes

### Env relevantes

| Variável | Uso |
|----------|-----|
| `DATABASE_URL` | PostgreSQL |
| `REDIS_URL` | OTP / reset tokens |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | Auth |
| `CORS_ORIGIN` | Mobile / web |
| `OTP_*` / `RESET_TOKEN_TTL_*` | Recuperação de senha |

`.env` e `.env.test` **não** vão para o git (só `.env.example`).

### Testes

Vitest + Supertest contra BD `ogona-test`.

- `resetDatabase()` trunca tabelas + flush Redis entre testes
- Helpers: registar host/guest, criar/publicar property, criar room
- Suites: auth, properties, rooms, calendar, reservations (fluxo completo + fee), discover, dashboard, system (ping/swagger)

**O que os testes garantem bem:** status HTTP, campos críticos (fee 9917, awaiting_payment, pay, photoUrl, destinos).  
**O que não é contrato OpenAPI campo-a-campo:** alguns campos secundários; pagamento real; upload de ficheiros.

Migrações: `drizzle/` (`0000` … `0006` inclui photo, awaiting_payment, fee, payment_method, min/max units).

---

## 11. Decisões que um reviewer pode questionar (e a resposta curta)

| Pergunta provável | Resposta |
|-------------------|----------|
| Porque roles separados no registo? | MVP simples; permissões claras; evoluir para multi-role depois |
| Porque fee arredondada? | UI mostra MT inteiros; 3.3% de 9600 = 316.8 → 317 |
| Porque accept ≠ confirmed? | Figma: pagamento depois da aprovação do host |
| Porque overlap inclui awaiting_payment? | Inventário reservado durante a janela de pagamento |
| Porque mês = 30 dias? | Aproximação MVP; calendário civil exacto pode vir depois |
| Porque pagamento stub? | Desbloquear app; contrato da rota já está certo |
| Porque telefone e não email? | Realidade MZ + M-Pesa |
| Porque URLs de imagem e não upload? | Menos complexidade; storage no cliente/CDN |
| Porque destinos hardcoded? | Grid fixo da home; contagens vêm da BD |
| Porque Drizzle e não Prisma? | SQL próximo, enums PG nativos, migrações previsíveis |
| Porque Redis só para OTP? | Dados efémeros; JWT não precisa de store |

---

## 12. Mapa rápido de ficheiros para navegar amanhã

```
backend/src/
  app.ts, server.ts
  routes/          ← lista completa de endpoints
  controllers/     ← HTTP fino
  services/        ← regras (reservation.service é o mais importante)
  repositories/    ← SQL + mappers (toPublicUser, toPublicReservation, …)
  dtos/            ← Zod
  db/schema/       ← modelo + enums
  middlewares/     ← auth, roles, validate, errors
  utils/pricing.ts ← fee, limites, checkout, destinos populares
  docs/openapi.ts  ← Swagger
tests/             ← regressão do fluxo
```

---

## 13. Fluxo mental “reservar uma noite” (end-to-end)

1. Host regista-se → cria property → publica → cria room com preço `noite: 3200`
2. Guest discover → abre property → abre room → `POST /quote` com `units: 3` → vê 9600 + 317 = 9917
3. Guest `POST /reservations` → status `pending`
4. Host dashboard vê pedido → `POST .../accept` → `awaiting_payment`, expira em 24h
5. Guest `POST .../pay` `{ method: "m_pesa" }` → `confirmed`
6. Guest pode `POST /reviews` e ver a reserva em `/reservations/mine?status=confirmed`

Se algo falhar no code review, começa por `reservation.service.ts` + `utils/pricing.ts` + migração `0006`.

---

*Última actualização: alinhada com o estado do repo após fluxo guest de reserva, photoUrl, destinos populares, Swagger e ping.*
