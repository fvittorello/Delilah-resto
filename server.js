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
	res.status(500).json({ error: err });
});
