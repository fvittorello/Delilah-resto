const express = require('express');
const router = express.Router();
const sequelize = require('../db');
const { validateToken } = require('../services/jwt.services');

router.get('/', validateToken, async (req, res) => {
	try {
		const { user_id, is_admin, is_disabled } = req.token_info;

		if (is_disabled) {
			res.status(403).json('Tu usuario fue desabilitado y no tenes acceso a los pedidos');
		}

		if (is_admin) {
			const pedidos = await sequelize.query('SELECT * FROM orders', { type: sequelize.QueryTypes.SELECT });

			res.status(200).json(pedidos);
		} else {
			const pedidos = await sequelize.query('SELECT * FROM orders WHERE user_id = :user_id', {
				replacements: {
					user_id,
				},
				type: sequelize.QueryTypes.SELECT,
			});

			res.status(200).sejsonnd(pedidos);
		}
	} catch (err) {
		console.log(err);
		res.status(500).json('Algo salio mal y no se pudieron traer los pedidos');
	}
});

router.post('/', validateToken, async (req, res) => {
	try {
		const { user_id, is_admin, is_disabled } = req.token_info;

		if (is_disabled) {
			res.status(403).json('Tu usuario se encuentra desabilitado y no puede hacer pedidos');
		} else {
			const { user_id, payment_type, order_description } = req.body;

			const nuevoPedido = await sequelize.query(
				'INSERT INTO orders (user_id, payment_type, order_description) VALUES (:user_id, :payment_type, :order_description)',
				{
					replacements: {
						user_id,
						payment_type,
						order_description,
					},
				}
			);

			res.status(201).json('El pedido se ingreso con exito!');
		}
	} catch (err) {
		console.log(err);
		res.status(500).json('Algo salio mal, no se pudo ingresar el pedido');
	}
});

router.patch('/:id', validateToken, async (req, res) => {
	try {
		const { is_admin, is_disabled } = req.token_info;

		if (is_admin && !is_disabled) {
			if (!req.body) {
				res.status(400).json('No se definieron los parametros a modificar');
			}

			const { status } = req.body;
			const modificarPedido = await sequelize.query(
				`UPDATE orders SET status = :status WHERE order_id = ${req.params.id}`,
				{
					replacements: {
						status,
					},
				}
			);

			res.status(201).json(`Se ha modificado con exito el pedido ${req.params.id}`);
		} else {
			res
				.status(403)
				.json('No tenes permisos de administrador o tu usuario se encuentra desabilitado para modificar pedidos');
		}
	} catch (err) {
		console.log(err);
		res.status(500).json('Algo salio mal, no se pudo modificar el pedido');
	}
});

module.exports = router;
