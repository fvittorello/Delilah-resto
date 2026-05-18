const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const app = express();
const apiVersion = 'v1';

dotenv.config();
app.set('port', process.env.PORT || 3000);

app.use(cors({
	origin: process.env.CORS_ORIGIN || '*',
	allowedHeaders: ['Content-Type', 'Authorization'],
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));
app.options('*', cors());
app.use(express.json());

app.listen(app.get('port'), () => {
	const date = new Date();
	console.log(`Servidor iniciado en el puerto ${app.get('port')} - ${date}`);
});

const loginRoute = require('./routes/login');
const usersRoute = require('./routes/users');
const productsRoute = require('./routes/products');
const ordersRoute = require('./routes/orders');

app.use(`/${apiVersion}/login`, loginRoute);
app.use(`/${apiVersion}/usuarios`, usersRoute);
app.use(`/${apiVersion}/productos`, productsRoute);
app.use(`/${apiVersion}/pedidos`, ordersRoute);

app.use((err, req, res, next) => {
	console.error(err);
	res.status(500).json({ message: 'Internal server error.' });
});
