/** OpenAPI 3 — Ogona MVP API */
export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Ogona API',
    version: '0.1.0',
    description:
      'API do MVP Ogona — alojamentos em Moçambique (hóspede + anfitrião). Moeda: MZN (MT).',
  },
  servers: [{ url: '/api/v1', description: 'API v1' }, { url: '/', description: 'Root' }],
  tags: [
    { name: 'System' },
    { name: 'Auth' },
    { name: 'Discover' },
    { name: 'Properties' },
    { name: 'Rooms' },
    { name: 'Reservations' },
    { name: 'Reviews' },
    { name: 'Calendar' },
    { name: 'Dashboard' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      SuccessEnvelope: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'object' },
        },
      },
      ErrorEnvelope: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              code: { type: 'string' },
            },
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          phone: { type: 'string', example: '+258841111111' },
          email: { type: 'string', nullable: true },
          photoUrl: { type: 'string', nullable: true },
          birthDate: { type: 'string', example: '1995-03-15' },
          role: { type: 'string', enum: ['guest', 'host'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Quote: {
        type: 'object',
        properties: {
          roomId: { type: 'string', format: 'uuid' },
          modality: { type: 'string', enum: ['hora', 'noite', 'semana', 'mes'] },
          units: { type: 'integer' },
          unitPrice: { type: 'number' },
          subtotalAmount: { type: 'number' },
          feePercent: { type: 'number', example: 3.3 },
          feeAmount: { type: 'number' },
          totalAmount: { type: 'number' },
          currency: { type: 'string', example: 'MZN' },
          estimatedEndTime: { type: 'string', nullable: true, example: '12:00' },
        },
      },
      Reservation: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          status: {
            type: 'string',
            enum: [
              'pending',
              'awaiting_payment',
              'confirmed',
              'rejected',
              'cancelled',
              'completed',
            ],
          },
          displayStatus: { type: 'string' },
          modality: { type: 'string' },
          checkInDate: { type: 'string', format: 'date' },
          checkOutDate: { type: 'string', format: 'date' },
          startTime: { type: 'string', nullable: true },
          units: { type: 'integer' },
          guestCount: { type: 'integer' },
          subtotalAmount: { type: 'number' },
          feeAmount: { type: 'number' },
          totalAmount: { type: 'number' },
          paymentMethod: { type: 'string', enum: ['m_pesa', 'e_mola'], nullable: true },
          expiresInSeconds: { type: 'integer', nullable: true },
          hostWhatsapp: { type: 'string', nullable: true },
        },
      },
    },
  },
  paths: {
    '/ping': {
      get: {
        tags: ['System'],
        summary: 'Ping (liveness)',
        servers: [{ url: '/' }],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        message: { type: 'string', example: 'pong' },
                        timestamp: { type: 'string', format: 'date-time' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Health check (DB + Redis)',
        responses: {
          '200': { description: 'Saudável' },
          '503': { description: 'Degradado' },
        },
      },
    },
    '/auth/register/guest': {
      post: {
        tags: ['Auth'],
        summary: 'Registar hóspede',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'birthDate', 'phone', 'password', 'confirmPassword'],
                properties: {
                  name: { type: 'string' },
                  birthDate: { type: 'string', example: '15/03/1995' },
                  phone: { type: 'string', example: '841111111' },
                  password: { type: 'string' },
                  confirmPassword: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Criado', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessEnvelope' } } } },
        },
      },
    },
    '/auth/register/host': {
      post: {
        tags: ['Auth'],
        summary: 'Registar anfitrião',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'birthDate', 'phone', 'password', 'confirmPassword'],
                properties: {
                  name: { type: 'string' },
                  birthDate: { type: 'string' },
                  phone: { type: 'string' },
                  password: { type: 'string' },
                  confirmPassword: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Criado' } },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login (telefone + senha)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['phone', 'password'],
                properties: {
                  phone: { type: 'string' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'JWT + user' } },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Perfil actual',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'User',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: { user: { $ref: '#/components/schemas/User' } },
                    },
                  },
                },
              },
            },
          },
        },
      },
      patch: {
        tags: ['Auth'],
        summary: 'Actualizar perfil (nome, email, photoUrl)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', nullable: true },
                  photoUrl: { type: 'string', format: 'uri', nullable: true },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'User actualizado' } },
      },
    },
    '/auth/password/forgot': {
      post: {
        tags: ['Auth'],
        summary: 'Iniciar recuperação de senha',
        responses: { '200': { description: 'OK' } },
      },
    },
    '/auth/password/send-otp': {
      post: {
        tags: ['Auth'],
        summary: 'Enviar OTP (SMS/WhatsApp Vonage)',
        responses: { '200': { description: 'OTP enviado' } },
      },
    },
    '/auth/password/verify-otp': {
      post: {
        tags: ['Auth'],
        summary: 'Verificar OTP',
        responses: { '200': { description: 'resetToken' } },
      },
    },
    '/auth/password/reset': {
      post: {
        tags: ['Auth'],
        summary: 'Definir nova senha',
        responses: { '200': { description: 'Senha actualizada' } },
      },
    },
    '/discover/home': {
      get: {
        tags: ['Discover'],
        summary: 'Home (perto / populares / cidades)',
        parameters: [
          { name: 'lat', in: 'query', schema: { type: 'number' } },
          { name: 'lng', in: 'query', schema: { type: 'number' } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: { '200': { description: 'Feed' } },
      },
    },
    '/discover/properties': {
      get: {
        tags: ['Discover'],
        summary: 'Pesquisar propriedades',
        parameters: [
          { name: 'q', in: 'query', schema: { type: 'string' } },
          { name: 'type', in: 'query', schema: { type: 'string' } },
          { name: 'city', in: 'query', schema: { type: 'string' } },
          { name: 'minPrice', in: 'query', schema: { type: 'number' } },
          { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
        ],
        responses: { '200': { description: 'Lista' } },
      },
    },
    '/discover/cities': {
      get: {
        tags: ['Discover'],
        summary: 'Cidades com propriedades publicadas',
        responses: { '200': { description: 'Lista de cidades' } },
      },
    },
    '/discover/popular-destinations': {
      get: {
        tags: ['Discover'],
        summary: 'Destinos populares (Maputo, Beira, …)',
        responses: { '200': { description: '6 destinos' } },
      },
    },
    '/discover/properties/{id}': {
      get: {
        tags: ['Discover'],
        summary: 'Detalhe público da propriedade',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'Propriedade + quartos' } },
      },
    },
    '/discover/rooms/{roomId}': {
      get: {
        tags: ['Discover'],
        summary: 'Detalhe público do quarto',
        parameters: [{ name: 'roomId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'Quarto + preços/modalidades' } },
      },
    },
    '/discover/favorites': {
      get: {
        tags: ['Discover'],
        summary: 'Favoritos do hóspede',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Lista' } },
      },
    },
    '/discover/favorites/{propertyId}': {
      post: {
        tags: ['Discover'],
        summary: 'Adicionar favorito',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'propertyId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '201': { description: 'Favoritado' } },
      },
      delete: {
        tags: ['Discover'],
        summary: 'Remover favorito',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'propertyId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'Removido' } },
      },
    },
    '/properties': {
      get: {
        tags: ['Properties'],
        summary: 'Listar propriedades do host',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Lista' } },
      },
      post: {
        tags: ['Properties'],
        summary: 'Criar propriedade',
        security: [{ bearerAuth: [] }],
        responses: { '201': { description: 'Criada' } },
      },
    },
    '/properties/{id}/rooms': {
      get: {
        tags: ['Rooms'],
        summary: 'Listar quartos da propriedade',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'Lista' } },
      },
      post: {
        tags: ['Rooms'],
        summary: 'Criar quarto (preços por modalidade)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '201': { description: 'Criado' } },
      },
    },
    '/reservations/quote': {
      post: {
        tags: ['Reservations'],
        summary: 'Calcular preço (Taxa Ogona 3.3%)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['roomId', 'modality', 'checkInDate', 'units'],
                properties: {
                  roomId: { type: 'string', format: 'uuid' },
                  modality: { type: 'string', enum: ['hora', 'noite', 'semana', 'mes'] },
                  checkInDate: { type: 'string', format: 'date', example: '2026-07-28' },
                  startTime: { type: 'string', example: '09:00', description: 'Obrigatório se modality=hora' },
                  units: { type: 'integer', example: 3 },
                  guestCount: { type: 'integer', default: 1 },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Quote',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: { quote: { $ref: '#/components/schemas/Quote' } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/reservations': {
      post: {
        tags: ['Reservations'],
        summary: 'Criar reserva (guest) → pending',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['roomId', 'modality', 'checkInDate', 'units'],
                properties: {
                  roomId: { type: 'string', format: 'uuid' },
                  modality: { type: 'string', enum: ['hora', 'noite', 'semana', 'mes'] },
                  checkInDate: { type: 'string', format: 'date' },
                  startTime: { type: 'string' },
                  units: { type: 'integer' },
                  guestCount: { type: 'integer' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Reserva criada' } },
      },
      get: {
        tags: ['Reservations'],
        summary: 'Listar reservas do host',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'status',
            in: 'query',
            schema: {
              type: 'string',
              enum: [
                'all',
                'pending',
                'awaiting_payment',
                'confirmed',
                'rejected',
                'cancelled',
                'completed',
              ],
            },
          },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'Lista' } },
      },
    },
    '/reservations/mine': {
      get: {
        tags: ['Reservations'],
        summary: 'Minhas reservas (guest)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'status',
            in: 'query',
            schema: {
              type: 'string',
              enum: [
                'all',
                'pending',
                'awaiting_payment',
                'confirmed',
                'rejected',
                'cancelled',
                'completed',
              ],
            },
          },
        ],
        responses: { '200': { description: 'Lista' } },
      },
    },
    '/reservations/mine/{id}': {
      get: {
        tags: ['Reservations'],
        summary: 'Detalhe da reserva (guest)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': {
            description: 'Reserva',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: { reservation: { $ref: '#/components/schemas/Reservation' } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/reservations/{id}/accept': {
      post: {
        tags: ['Reservations'],
        summary: 'Host aceita → awaiting_payment (24h)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'Aguardando pagamento' } },
      },
    },
    '/reservations/{id}/reject': {
      post: {
        tags: ['Reservations'],
        summary: 'Host rejeita',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'Rejeitada' } },
      },
    },
    '/reservations/{id}/pay': {
      post: {
        tags: ['Reservations'],
        summary: 'Guest paga (M-Pesa / e-Mola stub)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['method'],
                properties: {
                  method: { type: 'string', enum: ['m_pesa', 'e_mola'] },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'Confirmada' } },
      },
    },
    '/reservations/{id}/cancel': {
      post: {
        tags: ['Reservations'],
        summary: 'Guest cancela',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'Cancelada' } },
      },
    },
    '/reviews': {
      post: {
        tags: ['Reviews'],
        summary: 'Criar avaliação (após confirmed/completed)',
        security: [{ bearerAuth: [] }],
        responses: { '201': { description: 'Criada' } },
      },
    },
    '/dashboard': {
      get: {
        tags: ['Dashboard'],
        summary: 'Dashboard do host',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Métricas + actividade' } },
      },
    },
    '/rooms/{roomId}/calendar': {
      get: {
        tags: ['Calendar'],
        summary: 'Calendário do quarto (mês)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'roomId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          { name: 'year', in: 'query', schema: { type: 'integer' } },
          { name: 'month', in: 'query', schema: { type: 'integer' } },
        ],
        responses: { '200': { description: 'Dias do mês' } },
      },
    },
  },
} as const;
