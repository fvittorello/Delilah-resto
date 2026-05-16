const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const sequelize = require('../db/db');
const { validateToken } = require('../services/jwt.services');
const { validateOrderId, validateProductStatus } = require('../services/db.services');

const ORDER_STATUS = { CANCELLED: 6 };

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
		const { user_id, is_admin, is_disabled } = req.token_info;
		if (is_disabled) return res.status(403).json({ message: 'Tu cuenta fue desabilitada y no tiene acceso a los pedidos.' });

		const baseQuery = 'SELECT user_id, orders.order_id, orders_has_products.product_id, product_qty, unit_price, orders.created_at, order_status.status, payment_method.payment_method, order_description, title FROM orders_has_products INNER JOIN orders ON orders_has_products.order_id = orders.order_id INNER JOIN products ON orders_has_products.product_id = products.product_id INNER JOIN order_status ON orders.status = order_status.status_id INNER JOIN payment_method ON orders.payment_method = payment_method.payment_id';

		if (is_admin) {
			const pedidos = await sequelize.query(baseQuery, { type: sequelize.QueryTypes.SELECT });
			return res.status(200).json(pedidos);
		}

		const pedidos = await sequelize.query(baseQuery + ' WHERE user_id = :user_id', {
			replacements: { user_id },
			type: sequelize.QueryTypes.SELECT,
		});
		res.status(200).json(pedidos);
	} catch (err) {
		res.status(500).json({ message: 'Algo salio mal y no se pudieron traer los pedidos.' });
	}
});

router.get('/:id', validateId, validateToken, validateOrderId, async (req, res) => {
	try {
		const { user_id, is_admin, is_disabled } = req.token_info;
		if (is_disabled) return res.status(403).json({ message: 'Tu cuenta fue desabilitada y no tiene acceso a los pedidos.' });

		const baseQuery = 'SELECT user_id, orders.order_id, orders_has_products.product_id, product_qty, unit_price, orders.created_at, order_status.status, payment_method.payment_method, order_description, title FROM orders_has_products INNER JOIN orders ON orders_has_products.order_id = orders.order_id INNER JOIN products ON orders_has_products.product_id = products.product_id INNER JOIN order_status ON orders.status = order_status.status_id INNER JOIN payment_method ON orders.payment_method = payment_method.payment_id';

		if (is_admin) {
			const pedidos = await sequelize.query(baseQuery + ' WHERE orders.order_id = :order_id', {
				replacements: { order_id: req.params.id },
				type: sequelize.QueryTypes.SELECT,
			});
			return res.status(200).json(pedidos);
		}

		const pedidos = await sequelize.query(baseQuery + ' WHERE user_id = :user_id AND orders.order_id = :order_id', {
			replacements: { user_id, order_id: req.params.id },
			type: sequelize.QueryTypes.SELECT,
		});

		if (!pedidos.length) {
			return res.status(404).json({ message: `No se encontraron pedidos con el id = ${req.params.id}` });
		}

		res.status(200).json(pedidos);
	} catch (err) {
		res.status(500).json({ message: 'Algo salio mal y no se pudieron traer los pedidos.' });
	}
});

router.post(
	'/',
	validateToken,
	validateProductStatus,
	[
		body('payment_method').isInt({ min: 1 }).withMessage('El método de pago es requerido y debe ser un número válido.'),
		body('products').isArray({ min: 1 }).withMessage('Debe incluir al menos un producto.'),
		body('products.*.id').isInt({ min: 1 }).withMessage('Cada producto debe tener un id válido.'),
		body('products.*.qty').isInt({ min: 1 }).withMessage('La cantidad de cada producto debe ser al menos 1.'),
		checkValidation,
	],
	async (req, res) => {
		try {
			const { user_id, is_disabled } = req.token_info;
			if (is_disabled) return res.status(403).json({ message: 'Tu cuenta se encuentra desabilitada y no puede hacer nuevos pedidos.' });

			const { payment_method, products, order_description = null } = req.body;

			const newOrder = await sequelize.query(
				'INSERT INTO orders (user_id, payment_method, order_description) VALUES (:user_id, :payment_method, :order_description)',
				{
					replacements: { user_id, payment_method, order_description },
				}
			);

			await Promise.all(
				products.map(async (product) => {
					const prod_price = await sequelize.query('SELECT price FROM products WHERE product_id = :product_id', {
						replacements: { product_id: product.id },
						type: sequelize.QueryTypes.SELECT,
					});

					await sequelize.query(
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
				})
			);

			res.status(201).json({ message: `El pedido se ingreso con exito! el numero de seguimiento es #${newOrder[0]}` });
		} catch (err) {
			res.status(500).json({ message: 'Algo salio mal, no se pudo ingresar el pedido.' });
		}
	}
);

router.put(
	'/:id',
	validateId,
	validateToken,
	validateOrderId,
	[
		body('status').isInt({ min: 1 }).withMessage('El estado debe ser un número entero válido.'),
		checkValidation,
	],
	async (req, res) => {
		try {
			const { is_admin, is_disabled } = req.token_info;

			if (!is_admin || is_disabled) {
				return res.status(403).json({
					message: 'No tenes permisos de administrador o tu usuario se encuentra desabilitado para modificar pedidos.',
				});
			}

			if (!req.body.status) {
				return res.status(400).json({ message: 'No se definieron los parametros a modificar.' });
			}

			await sequelize.query('UPDATE orders SET status = :status WHERE order_id = :id', {
				replacements: { status: req.body.status, id: req.params.id },
				type: sequelize.QueryTypes.UPDATE,
			});

			res.status(200).json({ message: `Se ha modificado con exito el pedido ${req.params.id}` });
		} catch (err) {
			res.status(500).json({ message: 'Algo salio mal, no se pudo modificar el pedido.' });
		}
	}
);

router.delete('/:id', validateId, validateToken, validateOrderId, async (req, res) => {
	try {
		const { is_admin, is_disabled } = req.token_info;

		if (!is_admin || is_disabled) {
			return res.status(403).json({ message: 'Tu usuario se encuentra desabilitado o no tiene permisos para modificar ordenes.' });
		}

		await sequelize.query('UPDATE orders SET status = :status WHERE order_id = :id', {
			replacements: { status: ORDER_STATUS.CANCELLED, id: req.params.id },
			type: sequelize.QueryTypes.UPDATE,
		});

		res.status(200).json({ message: `Se ha cancelado la orden con id = ${req.params.id}` });
	} catch (err) {
		res.status(500).json({ message: 'Algo salio mal, no se pudo cancelar la orden.' });
	}
});

module.exports = router;
