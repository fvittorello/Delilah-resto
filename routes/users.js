const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { body, param, validationResult } = require('express-validator');
const sequelize = require('../db/db');
const { validateToken } = require('../services/jwt.services');

function checkValidation(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
	next();
}

const validateId = [
	param('id').isInt({ min: 1 }).withMessage('El id debe ser un número entero positivo.'),
	checkValidation,
];

router.get('/', validateToken, async (req, res) => {
	try {
		const { is_admin, is_disabled } = req.token_info;
		if (is_disabled) return res.status(401).json({ message: 'Tu cuenta se encuentra desabilitada.' });
		if (!is_admin) return res.status(403).json({ message: 'El usuario no tiene permisos de administrador.' });

		const users = await sequelize.query('SELECT * FROM users', { type: sequelize.QueryTypes.SELECT });
		res.status(200).json(users);
	} catch (err) {
		res.status(500).json({ message: 'Hubo un problema al intentar el pedido.' });
	}
});

router.get('/:id', validateId, validateToken, async (req, res) => {
	try {
		const { is_admin, is_disabled } = req.token_info;
		if (is_disabled) return res.status(401).json({ message: 'Tu cuenta se encuentra desabilitada.' });
		if (!is_admin) return res.status(403).json({ message: 'El usuario no tiene permisos de administrador.' });

		const users = await sequelize.query('SELECT * FROM users WHERE user_id = :user_id', {
			replacements: { user_id: req.params.id },
			type: sequelize.QueryTypes.SELECT,
		});

		res.status(200).json(users);
	} catch (err) {
		res.status(500).json({ message: 'Hubo un problema al intentar el pedido.' });
	}
});

router.post(
	'/',
	[
		body('username').notEmpty().withMessage('El username es requerido.').isLength({ min: 3 }).withMessage('El username debe tener al menos 3 caracteres.'),
		body('fullname').notEmpty().withMessage('El nombre completo es requerido.'),
		body('email').isEmail().withMessage('El email ingresado no es válido.'),
		body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres.'),
		body('phone').notEmpty().withMessage('El teléfono es requerido.'),
		body('address').notEmpty().withMessage('La dirección es requerida.'),
		checkValidation,
	],
	async (req, res) => {
		const { username, fullname, address, email, password, phone } = req.body;

		try {
			const hashedPassword = await bcrypt.hash(password, 10);

			await sequelize.query(
				'INSERT INTO users (username, fullname, address, email, password, phone) VALUES (:username, :fullname, :address, :email, :password, :phone)',
				{
					replacements: { username, fullname, address, email, password: hashedPassword, phone },
				}
			);

			res.status(201).json({ message: `Se ha creado con exito el usuario ${username}` });
		} catch (err) {
			res.status(500).json({ message: 'Algo salio mal, no se pudo crear el usuario.' });
		}
	}
);

router.put(
	'/:id',
	validateId,
	validateToken,
	[
		body('is_admin').isBoolean().withMessage('is_admin debe ser un valor booleano.'),
		body('is_disabled').isBoolean().withMessage('is_disabled debe ser un valor booleano.'),
		checkValidation,
	],
	async (req, res) => {
		try {
			const { is_admin, is_disabled } = req.token_info;
			if (is_disabled) return res.status(401).json({ message: 'Tu cuenta se encuentra desabilitada.' });
			if (!is_admin) return res.status(403).json({ message: 'No tenes permisos de administrador para modificar usuarios.' });

			await sequelize.query(
				'UPDATE users SET is_admin = :new_is_admin, is_disabled = :new_is_disabled WHERE user_id = :id',
				{
					replacements: {
						new_is_admin: req.body.is_admin,
						new_is_disabled: req.body.is_disabled,
						id: req.params.id,
					},
					type: sequelize.QueryTypes.UPDATE,
				}
			);

			res.status(200).json({ message: `Se ha modificado con exito el usuario con el id = ${req.params.id}` });
		} catch (err) {
			res.status(500).json({ message: 'Algo salio mal, no se pudo modificar el usuario.' });
		}
	}
);

router.delete('/:id', validateId, validateToken, async (req, res) => {
	try {
		const { is_admin, is_disabled } = req.token_info;

		if (!is_admin || is_disabled) {
			return res.status(403).json({ message: 'Tu usuario se encuentra desabilitado o no tiene permisos para modificar usuarios.' });
		}

		await sequelize.query('UPDATE users SET is_disabled = true WHERE user_id = :id', {
			replacements: { id: req.params.id },
			type: sequelize.QueryTypes.UPDATE,
		});

		res.status(200).json({ message: `Se ha desabilitado al usuario con id = ${req.params.id}` });
	} catch (err) {
		res.status(500).json({ message: 'Algo salio mal, no se pudo dar de baja al usuario.' });
	}
});

module.exports = router;
