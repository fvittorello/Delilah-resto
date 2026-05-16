const sequelize = require('../db/db');

async function validateProductId(req, res, next) {
	try {
		const product = await sequelize.query('SELECT * FROM products WHERE product_id = :product_id', {
			replacements: { product_id: req.params.id },
			type: sequelize.QueryTypes.SELECT,
		});

		if (!product.length) {
			return res.status(404).json({ message: `No se encontraron productos con el id = ${req.params.id}` });
		}
		next();
	} catch (err) {
		throw new Error(err);
	}
}

async function validateOrderId(req, res, next) {
	try {
		const order = await sequelize.query('SELECT * FROM orders WHERE order_id = :order_id', {
			replacements: { order_id: req.params.id },
			type: sequelize.QueryTypes.SELECT,
		});

		if (!order.length) {
			return res.status(404).json({ message: `No se encontró un pedido con el id = ${req.params.id}` });
		}
		next();
	} catch (err) {
		throw new Error(err);
	}
}

async function validateProductStatus(req, res, next) {
	try {
		const { products } = req.body;

		for (const item of products) {
			const query = await sequelize.query('SELECT is_disabled FROM products WHERE product_id = :product_id', {
				replacements: { product_id: item.id },
				type: sequelize.QueryTypes.SELECT,
			});

			if (!query.length) {
				return res.status(404).json({ message: `No se encontró el producto id = ${item.id}` });
			}
			if (query[0].is_disabled) {
				return res.status(403).json({ message: `El producto id = ${item.id} se encuentra desabilitado.` });
			}
		}

		next();
	} catch (err) {
		throw new Error(err);
	}
}

module.exports = { validateProductId, validateOrderId, validateProductStatus };
