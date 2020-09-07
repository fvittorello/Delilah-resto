const express = require('express');
const router = express.Router();
const sequelize = require('../db/db');
const { validateToken } = require('../services/jwt.services');

router.get('/', validateToken, async (req, res) => {
	try {
		const { is_admin, is_disabled } = req.token_info;
		if (is_disabled) {
			res.status(401).json('Tu cuenta se encuentra desabilitada.');
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

router.get('/:id', validateToken, async (req, res) => {
	try {
		const { is_admin, is_disabled } = req.token_info;
		if (is_disabled) {
			res.status(401).json('Tu cuenta se encuentra desabilitada.');
		}

		if (!is_admin) {
			res.status(401).json('El usuario no tiene permisos de administrador.');
		} else {
			const users = await sequelize.query('SELECT * FROM users WHERE user_id = :user_id', {
				replacements: {
					user_id: req.params.id,
				},
				type: sequelize.QueryTypes.SELECT,
			});

			res.status(200).json(users);
		}
	} catch (err) {
		console.log(err);
		res.status(401).json('Hubo un problema al intentar el pedido');
	}
});

router.post('/', async (req, res) => {
	const { username, fullname, address, email, password, phone } = req.body;

	try {
		const postUser = await sequelize.query(
			'INSERT INTO users (username, fullname, address, email, password, phone) VALUES (:username, :fullname, :address, :email, :password, :phone)',
			{
				replacements: {
					username,
					fullname,
					address,
					email,
					password,
					phone,
				},
			}
		);

		res.status(201).send(`Se ha creado con exito el usuario "${username}"`);
	} catch (err) {
		console.log(err);
		res.status(500).send('Algo salio mal, no se pudo crear el usuario');
	}
});

router.put('/:id', validateToken, async (req, res) => {
	try {
		const { is_admin, is_disabled } = req.token_info;

		if (is_disabled) {
			res.status(401).json('Tu cuenta se encuentra desabilitada.');
		}

		if (!is_admin) {
			res.status(401).json('No tenes permisos de administrador para modificar usuarios.');
		} else {
			const patch = await sequelize.query(
				`UPDATE users SET is_admin = ${req.body.is_admin}, is_disabled = ${req.body.is_disabled} WHERE user_id = ${req.params.id}`,
				{
					replacements: {
						is_admin,
						is_disabled,
					},
				}
			);

			res.status(201).send(`Se ha modificado con exito el usuario con el id = ${req.params.id}`);
		}
	} catch (error) {
		console.log(err);
		res.status(500).send('Algo salio mal, no se pudo modificar el usuario');
	}
});

router.delete('/:id', validateToken, async (req, res) => {
	try {
		const { is_admin, is_disabled } = req.token_info;

		if (is_admin && !is_disabled) {
			const disableUser = await sequelize.query(`UPDATE users SET is_disabled = true WHERE user_id = ${req.params.id}`);

			res.status(201).json(`Se ha desabilitado al usuario con id = ${req.params.id}`);
		} else {
			res.status(403).json('Tu usuario se encuentra desabilitado o no tiene permisos para modificar usuarios.');
		}
	} catch (err) {
		console.log(err);
		res.status(500).json('Algo salio mal, no se pudo dar de baja al usuario');
	}
});

module.exports = router;
