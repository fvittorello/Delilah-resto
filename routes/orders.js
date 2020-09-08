const express = require('express');
const router = express.Router();
const sequelize = require('../db/db');
const { validateToken } = require('../services/jwt.services');
const { validateOrderId, validateProductStatus } = require('../services/db.services');

router.get('/', validateToken, async (req, res) => {
	try {
		const { user_id, is_admin, is_disabled } = req.token_info;

		if (is_disabled) {
			res.status(403).json({ message: 'Tu cuenta fue desabilitada y no tiene acceso a los pedidos' });
		}

		if (is_admin) {
			const pedidos = await sequelize.query(
				'SELECT user_id, orders.order_id, orders_has_products.product_id, product_qty, unit_price, orders.created_at, order_status.status, payment_method.payment_method, order_description, title FROM orders_has_products INNER JOIN orders ON orders_has_products.order_id = orders.order_id INNER JOIN products ON orders_has_products.product_id = products.product_id INNER JOIN order_status ON orders.status = order_status.status_id INNER JOIN payment_method ON orders.payment_method = payment_method.payment_id',
				{ type: sequelize.QueryTypes.SELECT }
			);

			res.status(200).json(pedidos);
		} else {
			const pedidos = await sequelize.query(
				'SELECT user_id, orders.order_id, orders_has_products.product_id, product_qty, unit_price, orders.created_at, order_status.status, payment_method.payment_method, order_description, title FROM orders_has_products INNER JOIN orders ON orders_has_products.order_id = orders.order_id INNER JOIN products ON orders_has_products.product_id = products.product_id INNER JOIN order_status ON orders.status = order_status.status_id INNER JOIN payment_method ON orders.payment_method = payment_method.payment_id WHERE user_id = :user_id',
				{
					replacements: {
						user_id,
					},
					type: sequelize.QueryTypes.SELECT,
				}
			);

			res.status(200).json(pedidos);
		}
	} catch (err) {
		console.log(err);
		res.status(500).json({ message: 'Algo salio mal y no se pudieron traer los pedidos' });
	}
});

router.get('/:id', validateToken, validateOrderId, async (req, res) => {
	try {
		const { user_id, is_admin, is_disabled } = req.token_info;

		if (is_disabled) {
			res.status(403).json({ message: 'Tu cuenta fue desabilitada y no tiene acceso a los pedidos' });
		}

		if (is_admin) {
			const pedidos = await sequelize.query(
				'SELECT user_id, orders.order_id, orders_has_products.product_id, product_qty, unit_price, orders.created_at, order_status.status, payment_method.payment_method, order_description, title FROM orders_has_products INNER JOIN orders ON orders_has_products.order_id = orders.order_id INNER JOIN products ON orders_has_products.product_id = products.product_id INNER JOIN order_status ON orders.status = order_status.status_id INNER JOIN payment_method ON orders.payment_method = payment_method.payment_id WHERE orders.order_id = :order_id',
				{
					replacements: {
						order_id: req.params.id,
					},
					type: sequelize.QueryTypes.SELECT,
				}
			);

			res.status(200).json(pedidos);
		} else {
			const pedidos = await sequelize.query(
				'SELECT user_id, orders.order_id, orders_has_products.product_id, product_qty, unit_price, orders.created_at, order_status.status, payment_method.payment_method, order_description, title FROM orders_has_products INNER JOIN orders ON orders_has_products.order_id = orders.order_id INNER JOIN products ON orders_has_products.product_id = products.product_id INNER JOIN order_status ON orders.status = order_status.status_id INNER JOIN payment_method ON orders.payment_method = payment_method.payment_id WHERE user_id = :user_id AND orders.order_id = :order_id',
				{
					replacements: {
						user_id,
						order_id: req.params.id,
					},
					type: sequelize.QueryTypes.SELECT,
				}
			);

			if (!pedidos.length) {
				res.status(404).json({ message: `No se encontraron pedidos con el id = ${req.params.id}` });
			}

			res.status(200).json(pedidos);
		}
	} catch (err) {
		console.log(err);
		res.status(500).json({ message: 'Algo salio mal y no se pudieron traer los pedidos' });
	}
});

router.post('/', validateToken, validateProductStatus, async (req, res) => {
	try {
		const { user_id, is_disabled } = req.token_info;

		if (is_disabled) {
			res.status(403).json({ message: 'Tu cuenta se encuentra desabilitada y no puede hacer nuevos pedidos' });
		} else {
			const { payment_method, products, order_description = null } = req.body;

			const newOrder = await sequelize.query(
				'INSERT INTO orders (user_id, payment_method, order_description) VALUES (:user_id, :payment_method, :order_description)',
				{
					replacements: {
						user_id,
						payment_method,
						order_description,
					},
				}
			);

			console.log(`El valor de newOrder es = ${newOrder[0]}`);

			const producsOnOrder = products.forEach(async (product) => {
				const prod_price = await sequelize.query(`SELECT price FROM products WHERE product_id = :product_id`, {
					replacements: {
						product_id: product.id,
					},
					type: sequelize.QueryTypes.SELECT,
				});

				const insert_prod = await sequelize.query(
					'INSERT INTO orders_has_products (order_id, product_id, product_qty, unit_price) VALUES (:order_id, :product_id, :product_qty, :unit_price)',
					{
						replacements: {
							order_id: newOrder[0],
							product_id: product.id,
							product_qty: product.qty,
							unit_price: prod_price[0].price,
						},
					}
				);
			});

			res.status(201).json({ message: `El pedido se ingreso con exito! el numero de seguimiento es #${newOrder[0]}` });
		}
	} catch (err) {
		console.log(err);
		res.status(500).json({ message: 'Algo salio mal, no se pudo ingresar el pedido' });
		next(err);
	}
});

router.put('/:id', validateToken, validateOrderId, async (req, res) => {
	try {
		const { is_admin, is_disabled } = req.token_info;

		if (is_admin && !is_disabled) {
			if (!req.body) {
				res.status(400).json({ message: 'No se definieron los parametros a modificar' });
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

			res.status(201).json({ message: `Se ha modificado con exito el pedido ${req.params.id}` });
		} else {
			res.status(403).json({
				message: 'No tenes permisos de administrador o tu usuario se encuentra desabilitado para modificar pedidos',
			});
		}
	} catch (err) {
		console.log(err);
		res.status(500).json({ message: 'Algo salio mal, no se pudo modificar el pedido' });
	}
});

router.delete('/:id', validateToken, validateOrderId, async (req, res) => {
	try {
		const { is_admin, is_disabled } = req.token_info;

		if (is_admin && !is_disabled) {
			const cancelOrder = await sequelize.query(`UPDATE orders SET status = 6 WHERE order_id = ${req.params.id}`);

			res.status(201).json({ message: `Se ha cancelado la orden con id = ${req.params.id}` });
		} else {
			res
				.status(403)
				.json({ message: 'Tu usuario se encuentra desabilitado o no tiene permisos para modificar ordenes.' });
		}
	} catch (err) {
		console.log(err);
		res.status(500).json({ message: 'Algo salio mal, no se pudo cancelar la orden' });
	}
});

module.exports = router;
