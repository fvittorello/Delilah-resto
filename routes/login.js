const express = require('express');
const router = express.Router();
const sequelize = require('../db/db');
const { generateToken } = require('../services/jwt.services');

router.post('/', async (req, res) => {
	try {
		const { user_input, password } = req.body;
		console.log(`user input es = ${user_input} y password = ${password}`);

		const userData = await sequelize.query(
			'SELECT user_id, is_admin, is_disabled FROM users WHERE (username = :user_input OR email = :user_input) AND password = :password',
			{
				replacements: {
					user_input,
					password,
				},
				type: sequelize.QueryTypes.SELECT,
			}
		);

		console.log(userData[0]);

		if (!userData.length) {
			res.status(401).json({ message: 'El usuario o contraseña ingresados no son correctos.' });
		} else {
			const token_data = await generateToken(userData[0]);
			res.status(201).json({ token_data });
		}
	} catch (err) {
		console.log(err);
		res.status(401).json({ message: 'Algo salio mal y no se pudo finalizar el login' });
	}
});

module.exports = router;
