# Delilah Resto
![Delilah backend image](https://fvittorello.github.io/assets/md/delilah-back/mockup_delilah-backend.jpg)

Trabajo #3 del curso de Desarrollo Web Full Stack de Acamica.

El proyecto consistió en crear una API que le permita a los usuarios registrarse, ver un listado de productos disponibles y realizar pedidos de los mismos a un restaurant ficticio.
Para realizar dicha tarea la API consume y genera información en una base de datos relacional (MySQL) mediante distintos endpoints establecidos con Express.js.

## Funcionalidades del proyecto

- Registro y autenticación de usuarios mediante JWT.
- Búsqueda de usuarios `(general o por id, solo admin)`.
- Cambio de permisos de un usuario `(solo admin)`.
- Deshabilitación de un usuario `(solo admin)`.
- Búsqueda de productos `(general o por id)`.
- Alta, modificación y deshabilitación de un producto `(solo admin)`.
- Búsqueda de pedidos `(general o por id)`.
- Creación de pedidos con múltiples productos.
- Cambio del estado de un pedido `(solo admin)`.
- Cancelación de un pedido `(solo admin)`.

## Recursos y tecnologías utilizadas

- Node.js
- Express.js
- Sequelize
- MySQL
- JSON Web Token (JWT)
- bcryptjs
- cors
- express-validator
- dotenv

## Requisitos previos

- Node.js v14 o superior
- MySQL 5.7 o superior (o MariaDB equivalente)
- XAMPP, WAMP, Laragon u otro servidor MySQL local

## Cómo instalar y utilizar la API

### 1 - Clonar proyecto

```bash
git clone git@github.com:fvittorello/Delilah-resto.git
cd Delilah-resto
```

### 2 - Instalación de dependencias

```bash
npm install
```

### 3 - Crear la base de datos

- Iniciar el servidor MySQL local y asegurarse de que esté corriendo en el puerto `3306`.
- Crear una nueva base de datos llamada `delilah`.
- Importar el archivo `db/database.sql` para crear las tablas y cargar los datos de prueba.

> **Nota:** el archivo `database.sql` incluye sentencias `DROP TABLE IF EXISTS` al inicio, por lo que eliminará y recreará todas las tablas cada vez que se ejecute.

### 4 - Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

```
DB_CONNECT=mysql://root:@localhost:3306/delilah
TOKEN_SECRET=reemplazar_con_una_clave_secreta_segura
PORT=3000
```

> **Importante:** reemplazar `TOKEN_SECRET` con una cadena larga y aleatoria antes de usar la API. Nunca usar un valor simple como `jwtpass` fuera de entornos locales de desarrollo.
>
> Si el usuario `root` de MySQL tiene contraseña, el formato de `DB_CONNECT` es: `mysql://root:TU_PASSWORD@localhost:3306/delilah`

### 5 - Iniciar el servidor

```bash
# Producción
npm start

# Desarrollo (con recarga automática)
npm run dev
```

El servidor se iniciará por defecto en `http://localhost:3000`.

### 6 - Usuarios de prueba

El archivo `database.sql` carga los siguientes usuarios de prueba:

| Username | Password | Admin |
|----------|----------|-------|
| fervitto | admin | ✅ |
| test | test | ❌ |
| fmercuri | eeeooo | ❌ |
| jsmith | oooeee | ❌ |
| b-may | safestpass123 | ❌ |

---

## Documentación de la API

Todos los endpoints tienen el prefijo `/v1/`.

### Autenticación

Los endpoints protegidos requieren un token JWT en el header de la request:

```
Authorization: Bearer <token>
```

El token se obtiene haciendo POST a `/v1/login` y tiene una validez de **1 hora**.

---

### Login

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| POST | `/v1/login` | No | Autenticar usuario y obtener token |

**Body:**
```json
{
  "user_input": "fervitto",
  "password": "admin"
}
```

**Respuesta exitosa (200):**
```json
{
  "token_data": "<jwt_token>"
}
```

---

### Usuarios — `/v1/usuarios`

| Método | Endpoint | Auth | Admin | Descripción |
|--------|----------|------|-------|-------------|
| GET | `/v1/usuarios` | ✅ | ✅ | Listar todos los usuarios |
| GET | `/v1/usuarios/:id` | ✅ | ✅ | Obtener usuario por ID |
| POST | `/v1/usuarios` | No | No | Registrar nuevo usuario |
| PUT | `/v1/usuarios/:id` | ✅ | ✅ | Modificar permisos de un usuario |
| DELETE | `/v1/usuarios/:id` | ✅ | ✅ | Deshabilitar un usuario |

**POST `/v1/usuarios` — Body:**
```json
{
  "username": "nombreusuario",
  "fullname": "Nombre Completo",
  "email": "usuario@email.com",
  "password": "contraseña123",
  "phone": "1155554444",
  "address": "Calle Ejemplo 123"
}
```

**PUT `/v1/usuarios/:id` — Body:**
```json
{
  "is_admin": true,
  "is_disabled": false
}
```

---

### Productos — `/v1/productos`

| Método | Endpoint | Auth | Admin | Descripción |
|--------|----------|------|-------|-------------|
| GET | `/v1/productos` | ✅ | No | Listar productos (admin ve todos; usuarios solo los habilitados) |
| GET | `/v1/productos/:id` | ✅ | No | Obtener producto por ID |
| POST | `/v1/productos` | ✅ | ✅ | Crear nuevo producto |
| PUT | `/v1/productos/:id` | ✅ | ✅ | Modificar un producto |
| DELETE | `/v1/productos/:id` | ✅ | ✅ | Deshabilitar un producto |

**POST / PUT `/v1/productos` — Body:**
```json
{
  "image_url": "https://ejemplo.com/imagen.jpg",
  "title": "Nombre del producto",
  "price": 350,
  "prod_description": "Descripción opcional del producto"
}
```

En PUT se puede incluir además `"is_disabled": true` para deshabilitar el producto directamente.

---

### Pedidos — `/v1/pedidos`

| Método | Endpoint | Auth | Admin | Descripción |
|--------|----------|------|-------|-------------|
| GET | `/v1/pedidos` | ✅ | No | Listar pedidos (admin ve todos; usuarios ven solo los propios) |
| GET | `/v1/pedidos/:id` | ✅ | No | Obtener pedido por ID |
| POST | `/v1/pedidos` | ✅ | No | Crear nuevo pedido |
| PUT | `/v1/pedidos/:id` | ✅ | ✅ | Cambiar estado de un pedido |
| DELETE | `/v1/pedidos/:id` | ✅ | ✅ | Cancelar un pedido |

**POST `/v1/pedidos` — Body:**
```json
{
  "payment_method": 1,
  "products": [
    { "id": 1, "qty": 2 },
    { "id": 3, "qty": 1 }
  ],
  "order_description": "Sin cebolla"
}
```

**PUT `/v1/pedidos/:id` — Body:**
```json
{
  "status": 2
}
```

**Estados de pedido:**

| ID | Estado |
|----|--------|
| 1 | nuevo |
| 2 | confirmado |
| 3 | preparando |
| 4 | enviando |
| 5 | entregado |
| 6 | cancelado |

**Métodos de pago:**

| ID | Método |
|----|--------|
| 1 | efectivo |
| 2 | tarjeta de crédito |

---

## Referencia adicional

### [Postman — Delilah API v1](https://documenter.getpostman.com/view/11682039/TVCjx5su)
