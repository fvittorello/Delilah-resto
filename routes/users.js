const express = require('express');
const router = express.Router();
const sequelize = require('../db');
const { validateToken } = require('../services/jwt.services');

router.get('/', validateToken, async (req, res) => {
	try {
		const { is_admin, is_disabled } = req.token_info;
		if (is_disabled) {
			res.status(401).json('El usuario se encuentra desabilitado');
		}

		if (!is_admin) {
			res.status(401).json('El usuario no tiene permisos de administrador.');
		} else {
			const users = await sequelize.query('SELECT * FROM users', { type: sequelize.QueryTypes.SELECT });

			res.status(200).json(users);
		}
	} catch (err) {
		console.log(err);
		res.status(401).json('Hubo un problema al intentar el pedido');
	}
});

router.post('/', (req, res) => {
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
			res.status(201).send(`Se ha creado con exito el usuario "${req.body.username}"`);
		})
		.catch((err) => {
			console.log(err);
			res.status(500).send('Algo salio mal, no se pudo crear el usuario');
		});
});

router.patch('/:id', (req, res) => {
	sequelize
		.query(
			`UPDATE users SET is_admin = ${req.body.is_admin}, is_disabled = ${req.body.is_disabled} WHERE user_id = ${req.params.id}`
		)
		.then(() => {
			res.status(201).send(`Se ha modificado con exito el usuario "${req.params.id}"`);
		})
		.catch((err) => {
			console.log(err);
			res.status(500).send('Algo salio mal, no se pudo modificar el usuario');
		});
});

module.exports = router;
