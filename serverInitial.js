const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();

const { Sequelize } = require('sequelize');

// const sequelize = new Sequelize('mysql://root:@localhost:3306/database');
const sequelize = new Sequelize({
	dialect: 'mysql',
	username: 'root',
	password: null,
	host: 'localhost',
	port: 3306,
	database: 'delilah_test',
});

//	Settings
app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), () => {
	console.log(`Servidor iniciado en el puerto ${app.get('port')}`);
});

//	Middlewares
app.use(express.json());

app.use(function (err, req, res, next) {
	console.error(err.stack);
	res.status(500).send('Something broke!');
});

// function validateAdmin(req, res, next) {
// 	try {
// 		const username = req.body.username;

// 		sequelize
// 			.query(`SELECT is_admin FROM users where username = ${username}`, { type: sequelize.QueryTypes.SELECT })
// 			.then((resultados) => {});
// 	} catch (error) {
// 		console.error('El usuario no tiene permisos de administrador, ' + error);
// 	}
// }

//	Endpoints
app.post('/contacto', (req, res) => {
	res.json('[algo]');
});

app.get('/', (req, res) => {
	res.send('Hola Mundo!');
});

app.get('/usuarios', (req, res) => {
	sequelize.query('SELECT * FROM users', { type: sequelize.QueryTypes.SELECT }).then((resultados) => {
		res.send(resultados);
	});
});

app.post('/usuarios', (req, res) => {
	sequelize
		.query(
			'INSERT INTO users (username, fullname, address, email, password, phone) VALUES (:username, :fullname, :address, :email, :password, :phone)',
			{
				replacements: {
					username: req.body.username,
					fullname: req.body.fullname,
					address: req.body.address,
					email: req.body.email,
					password: req.body.password,
					phone: req.body.phone,
				},
			}
		)
		.then(() => {
			res.status(201).send(`Se ha creado con exito el usuario ${req.body.username}`);
		})
		.catch((err) => {
			console.log(err);
			res.status(500).send('Algo salio mal, no se pudo crear el usuario');
		});
});

app.patch('/usuarios/:id', (req, res) => {
	sequelize
		.query(
			`UPDATE users SET is_admin = ${req.body.is_admin}, is_disabled = ${req.body.is_disabled} WHERE user_id = ${req.params.id}`
		)
		.then(() => {
			res.status(201).send(`Se ha modificado con exito el usuario ${req.params.id}`);
		})
		.catch((err) => {
			console.log(err);
			res.status(500).send('Algo salio mal, no se pudo modificar el usuario');
		});
});

// app.post('/usuarios', (req, res) => {
// 	sequelize.query(INSERT INTO users (:username, :fullname, :address, :email, :password, :phone, :is_admin, :created_at) VALUES ('testUser', 'John Doe', 'jd@gmail.com', '1234', '1112341561', false, '2020-07-12 01:44:00'), { replacements: {username, fullname, email, password, phone, is_admin, created_at} })
// 		.then();
// });

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
