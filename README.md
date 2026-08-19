# API Backend – Plataforma de Eventos

API REST para una plataforma de gestión de eventos: permite registrar usuarios, publicar eventos, inscribirse con control de cupo y recibir confirmación por email. Construida con arquitectura por capas (routes → controllers → services → repositories → DAO → modelos).

## Temática

Plataforma de eventos (charlas, congresos, workshops, etc.) donde:

- Usuarios con rol **user** se inscriben a eventos publicados.
- Usuarios con rol **organizer** crean y administran sus propios eventos.
- Usuarios con rol **admin** administran cualquier evento y usuario.

## Tecnologías

- **Node.js** + **Express** — servidor HTTP y ruteo.
- **MongoDB** + **Mongoose** — persistencia.
- **Passport** (`passport-local`, `passport-jwt`) — estrategias `register`, `login` y `current`.
- **JWT** (`jsonwebtoken`) guardado en **cookie httpOnly** — sesión sin estado.
- **bcrypt** — hasheo de contraseñas.
- **Nodemailer** — email de confirmación de inscripción.
- **cookie-parser**, **cors**, **dotenv**.

## Arquitectura

```
src/
├── app.js               # configuración de express (middlewares, rutas, error handler)
├── server.js             # punto de entrada: conecta DB y levanta el servidor
├── config/                # env, conexión a Mongo, passport
├── models/                # esquemas de Mongoose (SOLO se importan desde dao/)
├── dao/                   # acceso a datos (usa los modelos de Mongoose)
├── repositories/          # capa intermedia consumida por los services
├── services/               # lógica de negocio y validaciones
├── controllers/            # coordinan request/response, sin lógica de negocio
├── dto/                    # dan forma a las respuestas (nunca exponen password)
├── routes/                 # definición de endpoints
├── middlewares/             # auth (401), authorize (403), manejo de errores
└── utils/                   # ApiError, JWT, hash, código de reserva, respuestas
scripts/
└── seed.js                 # crea usuarios y evento de prueba
```

**Regla de oro:** los modelos de Mongoose solo se importan en `dao/`; los `services` consumen `repositories`; los `controllers` solo coordinan request/response; las respuestas de usuario, evento y ticket pasan siempre por su DTO.

## Instalación

```bash
git clone <url-del-repositorio>
cd api-plataforma-eventos
npm install
cp .env.example .env
# completar .env con tus credenciales (ver abajo)
npm run seed     # opcional: crea usuarios y un evento de prueba
npm run dev       # o "npm start" para producción
```

El servidor arranca en `http://localhost:8080` (o el puerto definido en `PORT`).

## Variables de entorno

Ver [.env.example](./.env.example). Copiar a `.env` y completar:

| Variable | Descripción |
|---|---|
| `PORT` | Puerto del servidor HTTP |
| `MONGO_URL` | Cadena de conexión a MongoDB |
| `JWT_SECRET` | Secreto para firmar los JWT |
| `JWT_EXPIRES_IN` | Expiración del token (ej: `1d`) |
| `NODE_ENV` | `development` / `production` |
| `MAIL_HOST` | Host SMTP (ej: `smtp.gmail.com`) |
| `MAIL_PORT` | Puerto SMTP (ej: `587`) |
| `MAIL_USER` | Usuario/cuenta de email |
| `MAIL_PASS` | Contraseña o app password del email |
| `MAIL_FROM` | Remitente que verán los destinatarios |

> Para Gmail, `MAIL_PASS` debe ser una **contraseña de aplicación** (no la contraseña de la cuenta), generada con la verificación en 2 pasos activada.

## Comandos

| Comando | Descripción |
|---|---|
| `npm run dev` | Levanta el servidor con recarga automática (`node --watch`) |
| `npm start` | Levanta el servidor en modo normal |
| `npm run seed` | Crea usuarios de prueba (uno por rol) y un evento publicado de ejemplo |

## Roles

| Rol | Puede... |
|---|---|
| `user` | Registrarse, loguearse, inscribirse a eventos publicados, ver y cancelar sus propios tickets. Es el rol por defecto del registro público. |
| `organizer` | Todo lo de `user`, además crear eventos y modificar/cambiar de estado únicamente los eventos de los que es dueño. |
| `admin` | Todo lo anterior sobre cualquier evento/ticket, sin restricción de dueño. |

El registro público (`POST /api/sessions/register`) **ignora cualquier `role` enviado en el body** y siempre crea el usuario como `user`. Para tener un `organizer` o `admin` hay que crearlos con el script de seed o promoverlos manualmente en la base (`db.users.updateOne(...)`).

## Usuarios de prueba

Ejecutando `npm run seed` se crean:

| Email | Password | Rol |
|---|---|---|
| `user@test.com` | `Password123` | user |
| `organizer@test.com` | `Password123` | organizer |
| `admin@test.com` | `Password123` | admin |

También se crea un evento publicado de ejemplo ("Congreso Tech 2026") a nombre del organizador de prueba.

## Endpoints

### Sesiones (`/api/sessions`)

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/sessions/register` | — | Registra un usuario nuevo (rol `user` fijo) |
| POST | `/api/sessions/login` | — | Loguea y devuelve el JWT en cookie httpOnly |
| GET | `/api/sessions/current` | JWT | Devuelve el usuario autenticado |
| POST | `/api/sessions/logout` | — | Limpia la cookie de sesión |

### Eventos (`/api/events`)

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/events` | — | Lista eventos con filtros, paginación y orden |
| GET | `/api/events/:eid` | — | Detalle de un evento |
| POST | `/api/events` | organizer/admin | Crea un evento |
| PUT | `/api/events/:eid` | organizer dueño/admin | Modifica un evento (no si está cancelado) |
| PATCH | `/api/events/:eid/status` | organizer dueño/admin | Cambia el estado (`draft`/`published`/`cancelled`/`finished`) |

Filtros de listado (query params): `status`, `category`, `location`, `dateFrom`, `dateTo`, `page`, `limit`, `sort` (ej: `sort=date:desc`).

### Tickets / Inscripciones

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/events/:eid/tickets` | user/organizer/admin | Se inscribe al evento (valida publicado, cupo y duplicado) |
| GET | `/api/events/:eid/tickets` | organizer dueño/admin | Lista las inscripciones de ese evento |
| GET | `/api/tickets/my-tickets` | JWT | Lista las inscripciones propias |
| PATCH | `/api/tickets/:tid/cancel` | dueño/admin | Cancela un ticket (no lo elimina) |

## Ejemplos de uso

### Registro

```http
POST /api/sessions/register
Content-Type: application/json

{
  "first_name": "Ana",
  "last_name": "Gómez",
  "email": "ana@test.com",
  "password": "Password123"
}
```

### Login

```http
POST /api/sessions/login
Content-Type: application/json

{ "email": "ana@test.com", "password": "Password123" }
```

Respuesta: setea la cookie `eventosToken` (httpOnly) con el JWT. Todas las rutas protegidas leen el token desde esa cookie.

### Listado paginado de eventos

```http
GET /api/events?status=published&page=2&limit=5
```

```json
{
  "status": "success",
  "data": [ { "id": "...", "title": "Congreso Tech 2026", "status": "published" } ],
  "page": 2,
  "limit": 5,
  "total": 27,
  "totalPages": 6
}
```

### Inscripción a un evento

```http
POST /api/events/:eid/tickets
Cookie: eventosToken=...
Content-Type: application/json

{ "quantity": 1 }
```

Éxito (201):

```json
{
  "status": "success",
  "message": "Inscripción confirmada",
  "payload": {
    "id": "...",
    "event": "6690...",
    "user": "665f...",
    "quantity": 1,
    "status": "active",
    "reservationCode": "EVT-7QK2"
  }
}
```

Duplicado o sin cupo (409):

```json
{ "status": "error", "message": "Ya tenés una inscripción activa a este evento" }
```

## Flujo de autenticación

1. `POST /api/sessions/register` crea el usuario (`role: user`, password hasheada con bcrypt).
2. `POST /api/sessions/login` valida credenciales (estrategia `login` de Passport) y devuelve un JWT en una cookie `httpOnly`.
3. Las rutas protegidas usan la estrategia `current` (JWT extraído de la cookie) — si falta o es inválido responden **401**.
4. El middleware `authorize(...roles)` valida el rol de `req.user` sobre rutas concretas — si no corresponde responde **403**.
5. `POST /api/sessions/logout` limpia la cookie; a partir de ahí `GET /current` vuelve a responder 401.

## Flujo de inscripción

1. El evento debe estar en estado `published`.
2. Se verifica que el usuario no tenga ya una inscripción `active` para ese evento (409 si la tiene).
3. Se calcula el cupo ocupado sumando `quantity` de tickets `active` (los `cancelled` no cuentan) y se compara contra `capacity` (409 si no alcanza).
4. Se crea el ticket con un `reservationCode` único y se dispara el email de confirmación vía Nodemailer.
5. `PATCH /api/tickets/:tid/cancel` cambia el estado a `cancelled` (no borra el documento) y libera el cupo para nuevas inscripciones.

## Notas de seguridad

- Ninguna respuesta de la API expone el campo `password`.
- El registro público no acepta `role` desde el body.
- Las credenciales de email y el secreto JWT se leen únicamente desde variables de entorno.
- `.env`, `node_modules` y cualquier credencial quedan fuera del control de versiones (ver [.gitignore](./.gitignore)).
