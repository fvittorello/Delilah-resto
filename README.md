# Delilah Resto
![Delilah backend image](https://fvittorello.github.io/assets/md/delilah-back/mockup_delilah-backend.jpg)

Trabajo #3 del curso de Desarrollo Web Full Stack de Acamica.

El proyecto consistió en crear una API que le permita a los usuarios registrarse, ver un listado de productos disponibles y realizar pedidos de los mismos a un restaurant ficticio.
Para realizar dicha tarea la API consume y genera información en una base de datos relacional (mySQL) mediante distintos endpoints establecidos (ExpressJs).

## Funcionalidades del proyecto

- Crear un nuevo usuario.
- Autenticación de un usuario ya registrado.
- Busqueda de usuarios `(general o por id)`.
- Cambio de permisos de un usuario `(solo por un admin)`.
- Desabilitación de un usuario `(solo por un admin)`.
- Busqueda de productos `(general o por id)`.
- Cambio de parametros de un producto `(solo por un admin)`.
- Desabilitación de un producto `(solo por un admin)`.
- Busqueda de pedidos `(general o por id)`.
- Cambio del estado de un pedido `(solo por un admin)`.
- Cancelación de un pedido `(solo por un admin)`.

## Recursos y tecnologías utilizadas

- Node
- ExpressJs
- Sequelize
- MySQL
- JWT
- Dotenv
- Postman

## Como instalar y utilizar la API

### 1 - Clonar proyecto

Clonar el repositorio desde el [siguiente link](https://github.com/fvittorello/Delilah-resto).

Desde la consola con el siguiente link:

`git clone git@github.com:fvittorello/Delilah-resto.git .`

### 2 - Instalación de dependencias

```
npm install
```

### 3 - Creando base de datos

- Abrir con XAMPP u otro programa alternativo que soporte MySQL un servidor local y asegurarse que el puerto sobre el cual se está ejecutando es el `3306`
- Inicializar los servicios de Apache y MySQL
- Abrir el panel de control del servicio MySQL
- Generar una nueva base de datos llamada `delilah`.
- Dentro del `panel de control` de la base de datos creada importar el archivo `/db/database.sql`.

### 4 - Iniciando el servidor

- Crear un archivo `.env` en el repositorio local y declararle las siguientes variables.

```
DB_CONNECT = mysql://root:@localhost:3306/delilah
TOKEN_SECRET = jwtpass
```

- En la consola del IDE correr el comando `npm run start`.

### 5 - Listo para usar!

Testear los endpoints provistos desde postman para poder hacer uso de la API y base de datos generadas

## Documentación de la API

### [Postman - Delilah API v1](https://documenter.getpostman.com/view/11682039/TVCjx5su)
