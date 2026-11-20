# Entrega N°1 — Backend 3 (Coderhouse): Mocking de usuarios y mascotas

API en **Node.js + Express + MongoDB (Mongoose)** que incorpora un router de **mocks** para generar datos de prueba con **Faker**: mascotas y usuarios falsos con el mismo formato que devuelve Mongo, y un endpoint que genera e inserta registros en la base de datos para luego consultarlos con los servicios `GET` de users y pets.

**Autor:** Sebastián Felipe Muñoz Rivera

---

## Tecnologías

- Node.js (ES Modules) y Express 5
- MongoDB con Mongoose
- **@faker-js/faker** (generación de datos falsos)
- bcrypt (encriptación de contraseñas)
- Passport.js + JWT en cookie HTTP Only (autenticación heredada del proyecto anterior)
- dotenv

## Estructura del proyecto

```
src/
├── app.js                         # servidor Express; monta /api/sessions, /api/users, /api/pets y /api/mocks
├── config/
│   ├── db.js                      # conexión a MongoDB
│   └── passport.config.js         # estrategias register, login y current
├── mocks/
│   └── mocking.js                 # módulo de Mocking: generateUsers(n) y generatePets(n)
├── models/
│   ├── User.js                    # modelo User (incluye pets: [])
│   └── Pet.js                     # modelo Pet
├── routes/
│   ├── mocks.router.js            # /api/mocks → mockingpets, mockingusers, generateData
│   ├── users.router.js            # /api/users
│   ├── pets.router.js             # /api/pets
│   └── sessions.router.js         # /api/sessions
├── controllers/
│   ├── mocks.controller.js
│   ├── users.controller.js
│   ├── pets.controller.js
│   └── sessions.controller.js
├── middlewares/
│   └── passport.middleware.js
└── utils/
    ├── cookies.js
    ├── hash.js                    # bcrypt
    └── jwt.js
```

## Instalación y ejecución

```bash
git clone https://github.com/sebakine/Entrega-1-Backend-3.git
cd Entrega-1-Backend-3
npm install
cp .env.example .env    # completar con los valores reales
npm start               # o: npm run dev
```

El servidor queda escuchando en `http://localhost:<PORT>` (por defecto `8080`).

## Variables de entorno

Definidas en `.env` (no se sube al repositorio). Ver `.env.example`:

| Variable         | Descripción                                   |
| ---------------- | --------------------------------------------- |
| `PORT`           | Puerto del servidor                           |
| `MONGO_URL`      | Cadena de conexión a MongoDB                  |
| `JWT_SECRET`     | Clave secreta para firmar los JWT             |
| `JWT_EXPIRES_IN` | Expiración del JWT (ej. `1h`)                 |
| `NODE_ENV`       | `development` o `production`                  |

---

## Router de Mocks — `/api/mocks`

Definido en `src/routes/mocks.router.js` y montado en `app.js` con `app.use('/api/mocks', mocksRouter)`.

| Método | Path                         | Descripción                                                                 |
| ------ | ---------------------------- | --------------------------------------------------------------------------- |
| GET    | `/api/mocks/mockingpets`     | Genera mascotas falsas (por defecto 100; opcional `?quantity=N`). No inserta. |
| GET    | `/api/mocks/mockingusers`    | Genera **50 usuarios** con formato de Mongo (opcional `?quantity=N`). No inserta. |
| POST   | `/api/mocks/generateData`    | Recibe `users` y `pets`, genera esa cantidad de registros y **los inserta** en la base. |

`quantity`, `users` y `pets` deben ser enteros entre `0` y `1000`; si no, responde `400`.

### Módulo de Mocking (`src/mocks/mocking.js`)

- `generateUsers(quantity)` genera `quantity` usuarios donde:
  - `password` es **`coder123` encriptada con bcrypt** (se hashea una sola vez y se reutiliza).
  - `role` varía aleatoriamente entre **`user`** y **`admin`**.
  - `pets` es un **array vacío**.
  - Incluye `_id` (ObjectId), `createdAt`, `updatedAt` y `__v`, igual que un documento devuelto por Mongo.
  - El email lleva un sufijo aleatorio para no chocar con el índice único.
- `generatePets(quantity)` genera mascotas con `name`, `specie`, `birthDate`, `adopted: false`, `owner: null`, `image`, `_id`, timestamps y `__v`.

### `GET /api/mocks/mockingusers`

Response `200` (50 elementos):

```json
{
  "status": "success",
  "payload": [
    {
      "_id": "6b00bd82eeedbb3610b77a3b",
      "first_name": "Bennett",
      "last_name": "Konopelski",
      "email": "bennett_konopelski56.ykeq3i@mock.com",
      "password": "$2b$10$dfWAL44/EJlb0TuE8Xm/WeJGvFqJgnNfpyN9mj0G9NOn26El2wekK",
      "role": "admin",
      "pets": [],
      "createdAt": "2026-11-20T21:37:06.740Z",
      "updatedAt": "2026-11-20T21:37:06.740Z",
      "__v": 0
    }
  ]
}
```

### `GET /api/mocks/mockingpets`

Response `200` (100 elementos por defecto):

```json
{
  "status": "success",
  "payload": [
    {
      "_id": "6b00bd82eeedbb3610b779d7",
      "name": "Max",
      "specie": "tortuga",
      "birthDate": "2017-02-23T05:57:38.303Z",
      "adopted": false,
      "owner": null,
      "image": "https://picsum.photos/seed/eeP2vK9Xzo/3051/1704",
      "createdAt": "2026-11-20T21:37:06.463Z",
      "updatedAt": "2026-11-20T21:37:06.463Z",
      "__v": 0
    }
  ]
}
```

### `POST /api/mocks/generateData`

Request (body JSON; también se aceptan por query: `?users=5&pets=7`):

```json
{ "users": 5, "pets": 7 }
```

Response `201`:

```json
{
  "status": "success",
  "message": "Se insertaron 5 usuarios y 7 mascotas",
  "payload": {
    "users": 5,
    "pets": 7,
    "userIds": ["6b00bd83eeedbb3610b77a70", "..."],
    "petIds": ["6b00bd83eeedbb3610b77a79", "..."]
  }
}
```

Response `400`:

```json
{ "status": "error", "message": "\"users\" debe ser un número entero entre 0 y 1000" }
```

---

## Comprobación con los servicios GET de users y pets

| Método | Path                | Descripción                                   |
| ------ | ------------------- | --------------------------------------------- |
| GET    | `/api/users`        | Lista los usuarios guardados (sin `password`) |
| GET    | `/api/users/:uid`   | Obtiene un usuario por id                     |
| GET    | `/api/pets`         | Lista las mascotas guardadas                  |
| GET    | `/api/pets/:pid`    | Obtiene una mascota por id                    |

Las respuestas de listado incluyen `count` para verificar rápidamente cuántos registros hay:

```json
{ "status": "success", "count": 5, "payload": [ ... ] }
```

Flujo de verificación:

1. `GET /api/users` y `GET /api/pets` → anotar `count` (ej. `0` y `0`).
2. `POST /api/mocks/generateData` con `{ "users": 5, "pets": 7 }`.
3. `GET /api/users` → `count: 5`; `GET /api/pets` → `count: 7`.
4. Opcional: `POST /api/sessions/login` con el email de un usuario generado y la contraseña `coder123` → `200 Login correcto` (confirma que la contraseña quedó encriptada correctamente).

## Casos probados

| # | Caso                                                         | Resultado obtenido                                   |
| - | ------------------------------------------------------------ | ---------------------------------------------------- |
| 1 | `GET /api/mocks/mockingpets`                                 | 200, 100 mascotas con `_id`, timestamps y `__v`      |
| 2 | `GET /api/mocks/mockingusers`                                | 200, 50 usuarios; roles `user` y `admin`; `pets: []` |
| 3 | `bcrypt.compare('coder123', password)` de un usuario mock    | `true`                                               |
| 4 | `GET /api/users` y `/api/pets` antes de generar              | `count: 0` y `count: 0`                              |
| 5 | `POST /api/mocks/generateData` `{ users: 5, pets: 7 }`       | 201 `Se insertaron 5 usuarios y 7 mascotas`          |
| 6 | `GET /api/users` y `/api/pets` después de generar            | `count: 5` y `count: 7`                              |
| 7 | Login con un usuario generado y `coder123`                   | 200 `Login correcto`                                 |
| 8 | `generateData` con `users: "abc"` / sin parámetros           | 400 con mensaje descriptivo                          |

---

## Autenticación (`/api/sessions`)

Se mantiene del proyecto anterior: `POST /register`, `POST /login`, `GET /current` y `POST /logout`, con estrategias de Passport (`register`, `login`, `current`) y JWT guardado en la cookie HTTP Only `currentUser`.
