const express = require('express');
const router = express.Router();

const sequelize = require('../db');

router.get('/', (req, res) => {
	sequelize.query('SELECT * FROM orders', { type: sequelize.QueryTypes.SELECT }).then((resultados) => {
		res.status(200).send(resultados);
	});
});

router.post('/', (req, res) => {
	sequelize
		.query(
			'INSERT INTO orders (user_id, payment_type, order_description, total) VALUES (:user_id, :payment_type, :order_description, :total)',
			{
				replacements: {
					user_id: req.body.user_id,
					payment_type: req.body.payment_type,
					order_description: req.body.order_description,
					total: req.body.total,
				},
			}
		)
		.then(() => {
			res.status(201).send('El pedido se ingreso con exito!');
		})
		.catch((err) => {
			console.log(err);
			res.status(500).send('Algo salio mal, no se pudo ingresar el pedido');
		});
});

router.patch('/:id', (req, res) => {
	if (!req.body) {
		res.status(400).send('No se definieron los parametros a modificar');
	}
	sequelize
		.query(`UPDATE orders SET status = :status WHERE order_id = ${req.params.id}`, {
			replacements: {
				status: req.body.status,
			},
		})
		.then(() => {
			res.status(201).send(`Se ha modificado con exito el pedido ${req.params.id}`);
		})
		.catch((err) => {
			console.log(err);
			res.status(500).send('Algo salio mal, no se pudo modificar el pedido');
		});
});

module.exports = router;
