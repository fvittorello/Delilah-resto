const express = require('express');
// const jwt = require('jsonwebtoken');
const app = express();
const dotenv = require('dotenv');
const apiVersion = 'v1';

//	Settings
dotenv.config();
app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), () => {
	const date = new Date();
	console.log(`Servidor iniciado en el puerto ${app.get('port')} - ${date}`);
});

app.use(express.json());

//	Import Routes
const loginRoute = require('./routes/login');
const usersRoute = require('./routes/users');
const productsRoute = require('./routes/products');
const ordersRoute = require('./routes/orders');

app.use(`/${apiVersion}/login`, loginRoute);
app.use(`/${apiVersion}/usuarios`, usersRoute);
app.use(`/${apiVersion}/productos`, productsRoute);
app.use(`/${apiVersion}/pedidos`, ordersRoute);

//	Error Handler
app.use((err, req, res, next) => {
	console.error(err);
	res.status(500).send('Something broke big time!', err);
});

//	Endpoints
/*
	- Crear un nuevo usuario

	- Autenticar usuario con jwt (Buscar variables de entorno y como almacenarlas en Postman)

	- Dar de baja un usuario (flag only) [ACTUALIZAR USUARIO - solo admin]

	- Traer todos los pedidos ? [solo propios si no es admin || todos si es admin]

	- Traer un pedido y actualizar su estado (nuevo, confirmado, preparando, enviando, entregado)

	- Traer un usuario y cambiarle los permisos [ACTUALIZAR USUARIO - solo admin]

	- Calcular monto total [Middleware]

	- Dar de alta un pedido (asignar usuario, asignar productos y cantidades, estado default) 

	- Actualizar stock de productos [Middleware]

	- Dar de baja un pedido (flag only) [ACTUALIZAR PEDIDO - solo admin ? ]

*/
