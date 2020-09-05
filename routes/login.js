const express = require('express');
const router = express.Router();
const sequelize = require('../db');
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

		const token_data = await generateToken(userData[0]);
		res.status(201).send({ token_data });
	} catch (err) {
		console.log(err);
		res.status(401).json('El usuario o contraseña ingresados no son correctos.');
	}
});

module.exports = router;
