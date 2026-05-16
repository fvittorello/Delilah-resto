const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const sequelize = require('../db/db');
const { generateToken } = require('../services/jwt.services');

router.post('/', async (req, res) => {
	try {
		const { user_input, password } = req.body;

		if (!user_input || !password) {
			return res.status(400).json({ message: 'Los campos user_input y password son requeridos.' });
		}

		const userData = await sequelize.query(
			'SELECT user_id, is_admin, is_disabled, password AS hashed_password FROM users WHERE username = :user_input OR email = :user_input',
			{
				replacements: { user_input },
				type: sequelize.QueryTypes.SELECT,
			}
		);

		if (!userData.length) {
			return res.status(401).json({ message: 'El usuario o contraseña ingresados no son correctos.' });
		}

		const user = userData[0];
		const passwordMatch = await bcrypt.compare(password, user.hashed_password);

		if (!passwordMatch) {
			return res.status(401).json({ message: 'El usuario o contraseña ingresados no son correctos.' });
		}

		const token_data = generateToken({ user_id: user.user_id, is_admin: user.is_admin, is_disabled: user.is_disabled });
		res.status(200).json({ token_data });
	} catch (err) {
		res.status(500).json({ message: 'Algo salio mal y no se pudo finalizar el login.' });
	}
});

module.exports = router;
