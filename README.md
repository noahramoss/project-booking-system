# 🏨 Booking System — API REST

Sistema de reservas hoteleras desarrollado con Node.js, Express y PostgreSQL. Permite gestionar usuarios, hoteles, habitaciones y reservas con autenticación JWT y control de acceso basado en roles.

## Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| **Express.js** | Framework HTTP para la API REST |
| **PostgreSQL** | Base de datos relacional |
| **Prisma** | ORM para el acceso a datos |
| **JWT** | Autenticación basada en tokens |
| **bcryptjs** | Hashing seguro de contraseñas |
| **Zod** | Validación de datos de entrada |
| **Morgan** | Logger de peticiones HTTP |
| **CORS** | Control de orígenes permitidos |
| **Vitest + Supertest** | Tests de integración |

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/noahramoss/project-booking-system.git
cd project-booking-system
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y edítalo con tus credenciales:

```bash
cp .env.example .env
```

Edita `.env` con tu configuración:

```env
PORT=3000
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/booking_system?schema=public"
JWT_SECRET="tu_secreto_jwt_seguro"
```

### 4. Crear la base de datos y ejecutar migraciones

```bash
npx prisma migrate dev
```

### 5. (Opcional) Poblar la base de datos con datos de prueba

```bash
npx prisma db seed
```

Esto creará usuarios de ejemplo con las siguientes credenciales:

| Rol | Email | Contraseña |
|---|---|---|
| ADMIN | admin@bookingsystem.com | Admin123! |
| MANAGER | carlos@bookingsystem.com | Manager123! |
| MANAGER | maria@bookingsystem.com | Manager123! |
| USER | juan@email.com | User123! |
| USER | ana@email.com | User123! |

### 6. Arrancar el servidor

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`.

## Tests

Ejecutar todos los tests de integración:

```bash
npm test
```

## Estructura del proyecto

```
project-booking-system/
├── prisma/
│   ├── migrations/         # Migraciones de la base de datos
│   ├── schema.prisma       # Modelo de datos
│   └── seed.js             # Datos de prueba
├── src/
│   ├── auth/               # Autenticación (register, login)
│   │   ├── auth.controller.js
│   │   ├── auth.routes.js
│   │   └── auth.schema.js
│   ├── user/               # Gestión de usuarios
│   │   ├── user.controller.js
│   │   ├── user.routes.js
│   │   └── user.schema.js
│   ├── hotel/              # Gestión de hoteles
│   │   ├── hotel.controller.js
│   │   ├── hotel.routes.js
│   │   └── hotel.schema.js
│   ├── room/               # Gestión de habitaciones
│   │   ├── room.controller.js
│   │   ├── room.routes.js
│   │   └── room.schema.js
│   ├── booking/            # Gestión de reservas
│   │   ├── booking.controller.js
│   │   ├── booking.routes.js
│   │   └── booking.schema.js
│   ├── middleware/         # Middlewares
│   │   ├── auth.middleware.js
│   │   ├── validate.middleware.js
│   │   └── errorHandler.js
│   ├── config/
│   │   └── prisma.js       # Cliente Prisma
│   └── utils/
│       └── AppError.js     # Clase de errores personalizados
├── tests/                  # Tests de integración
│   ├── setup.js
│   ├── auth.test.js
│   ├── hotel.test.js
│   ├── room.test.js
│   └── booking.test.js
├── postman/                # Colección de Postman
├── app.js                  # Configuración de Express
├── server.js               # Punto de entrada
└── vitest.config.js        # Configuración de tests
```

## Modelo de datos

```mermaid
erDiagram
    User ||--o{ Hotel : "gestiona (MANAGER)"
    User ||--o{ Booking : "realiza"
    Hotel ||--o{ Room : "tiene"
    Room ||--o{ Booking : "se reserva"

    User {
        String id PK
        String name
        String email UK
        String passwordHash
        Role role
        DateTime createdAt
        DateTime updatedAt
    }

    Hotel {
        String id PK
        String name UK
        String description
        String city
        String country
        Int stars
        String managerId FK
        DateTime createdAt
        DateTime updatedAt
    }

    Room {
        String id PK
        Int number
        RoomType type
        Int capacity
        Decimal price
        String hotelId FK
        DateTime createdAt
        DateTime updatedAt
    }

    Booking {
        String id PK
        String userId FK
        String roomId FK
        DateTime checkIn
        DateTime checkOut
        BookingStatus status
        Decimal totalPrice
        DateTime createdAt
        DateTime updatedAt
    }
```

## Roles y permisos

| Acción | USER | MANAGER | ADMIN |
|---|---|---|---|
| Registrarse / Login | ✅ | ✅ | ✅ |
| Ver su propio perfil | ✅ | ✅ | ✅ |
| Editar su propio perfil | ✅ | ✅ | ✅ |
| Eliminar su propia cuenta | ✅ | ✅ | ❌ |
| Ver lista de usuarios | ❌ | ✅ (solo clientes de sus hoteles) | ✅ (todos) |
| Eliminar otro usuario | ❌ | ❌ | ✅ |
| Ver hoteles | ✅ | ✅ | ✅ |
| Crear/editar/eliminar hoteles | ❌ | ✅ (solo los suyos) | ✅ |
| Ver habitaciones | ✅ | ✅ | ✅ |
| Crear/editar/eliminar habitaciones | ❌ | ✅ (solo de sus hoteles) | ✅ |
| Crear reservas | ✅ | ✅ | ✅ |
| Ver reservas | ✅ (solo las suyas) | ✅ (solo de sus hoteles) | ✅ (todas) |
| Cancelar reservas | ✅ (solo las suyas) | ✅ (de sus hoteles) | ✅ |
| Eliminar reservas | ❌ | ❌ | ✅ |

## Endpoints de la API

### Autenticación — `/api/auth`

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Registrar nuevo usuario | No |
| `POST` | `/api/auth/login` | Iniciar sesión | No |

### Usuarios — `/api/user`

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| `GET` | `/api/user/me` | Ver mi perfil | Token |
| `PATCH` | `/api/user/me` | Actualizar mi perfil | Token |
| `DELETE` | `/api/user/me` | Eliminar mi cuenta | Token |
| `GET` | `/api/user` | Listar usuarios | MANAGER / ADMIN |
| `GET` | `/api/user/:id` | Ver un usuario | MANAGER / ADMIN |
| `DELETE` | `/api/user/:id` | Eliminar un usuario | ADMIN |

### Hoteles — `/api/hotel`

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| `GET` | `/api/hotel` | Listar hoteles (filtros: name, city, country, stars) | No |
| `POST` | `/api/hotel` | Crear hotel | MANAGER |
| `GET` | `/api/hotel/:id` | Ver un hotel | No |
| `PATCH` | `/api/hotel/:id` | Actualizar hotel | MANAGER / ADMIN |
| `DELETE` | `/api/hotel/:id` | Eliminar hotel | MANAGER / ADMIN |

### Habitaciones — `/api/room`

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| `GET` | `/api/room` | Listar habitaciones | No |
| `POST` | `/api/room` | Crear habitación | MANAGER / ADMIN |
| `GET` | `/api/room/:id` | Ver una habitación | No |
| `PATCH` | `/api/room/:id` | Actualizar habitación | MANAGER / ADMIN |
| `DELETE` | `/api/room/:id` | Eliminar habitación | MANAGER / ADMIN |

### Reservas — `/api/booking`

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| `GET` | `/api/booking` | Listar reservas (filtro: status) | Token |
| `POST` | `/api/booking` | Crear reserva | Token |
| `GET` | `/api/booking/:id` | Ver una reserva | Token |
| `PATCH` | `/api/booking/:id` | Actualizar estado de reserva | Token |
| `DELETE` | `/api/booking/:id` | Eliminar reserva | ADMIN |

## Reglas de negocio

- **Disponibilidad**: No se pueden crear reservas en fechas que se solapen con una reserva activa (no cancelada) de la misma habitación.
- **Cálculo de precio**: El precio total se calcula automáticamente como `número de noches × precio por noche`.
- **Cancelación**: Los usuarios solo pueden cancelar sus propias reservas. No se puede modificar una reserva ya cancelada.
- **Eliminación en cascada**: Al eliminar un usuario, se eliminan automáticamente sus hoteles, habitaciones y reservas asociadas.
- **Protección de admin**: Un administrador no puede eliminarse a sí mismo.
