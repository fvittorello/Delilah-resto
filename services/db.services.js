const sequelize = require('../db');

async function validateProductId(req, res, next) {
	try {
		const product = await sequelize.query('SELECT * FROM products WHERE product_id = :product_id', {
			replacements: {
				product_id: req.params.id,
			},
			type: sequelize.QueryTypes.SELECT,
		});

		console.log('product es ' + product[0]);

		if (!product.length) {
			res.status(404).json(`No se encontraron productos con el id = ${req.params.id}`);
		} else {
			next();
		}
	} catch (err) {
		console.log(`error: ${err}`);
		throw new Error(err);
	}
}

async function validateOrderId(req, res, next) {
	try {
		const order = await sequelize.query('SELECT * FROM orders WHERE order_id = :order_id', {
			replacements: {
				order_id: req.params.id,
			},
			type: sequelize.QueryTypes.SELECT,
		});

		if (!order.length) {
			res.status(404).json(`No se encontró un pedido con el id = ${req.params.id}`);
		} else {
			next();
		}
	} catch (err) {
		console.log(`error: ${err}`);
		throw new Error(err);
	}
}

async function validateProductStatus(req, res, next) {
	try {
		const { products } = req.body;

		products.forEach(async (item) => {
			const query = await sequelize.query('SELECT is_disabled FROM products WHERE product_id = :product_id', {
				replacements: {
					product_id: item.id,
				},
				type: sequelize.QueryTypes.SELECT,
			});

			if (!query.length) {
				return res.status(404).json(`No se encontró el producto id = ${item.id}`);
			} else if (query[0].is_disabled) {
				return res.status(403).json(`El producto id = ${item.id} se encuentra desabilitado.`);
			}
		});

		next();
	} catch (err) {
		console.log(`error: ${err}`);
		throw new Error(err);
	}
}

module.exports = { validateProductId, validateOrderId, validateProductStatus };
