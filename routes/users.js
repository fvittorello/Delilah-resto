const express = require('express');
const router = express.Router();

const sequelize = require('../db');

router.get('/', (req, res) => {
	sequelize.query('SELECT * FROM users', { type: sequelize.QueryTypes.SELECT }).then((resultados) => {
		res.send(resultados);
	});
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
