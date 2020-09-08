const express = require('express');
const router = express.Router();
const sequelize = require('../db/db');
const { validateToken } = require('../services/jwt.services');
const { validateProductId } = require('../services/db.services');

router.get('/', validateToken, async (req, res) => {
	try {
		const { is_admin, is_disabled } = req.token_info;

		if (is_admin && !is_disabled) {
			const products = await sequelize.query('SELECT * FROM products', { type: sequelize.QueryTypes.SELECT });

			res.status(201).json(products);
		} else {
			const products = await sequelize.query('SELECT * FROM products WHERE is_disabled = "false"', {
				type: sequelize.QueryTypes.SELECT,
			});

			res.status(201).json(products);
		}
	} catch (err) {
		console.log(err);
		res.status(500).json({ message: 'Algo salio mal y no se pudo realizar el request de productos' });
	}
});

router.get('/:id', validateToken, validateProductId, async (req, res) => {
	try {
		const { is_admin, is_disabled } = req.token_info;

		if (is_admin && !is_disabled) {
			const products = await sequelize.query('SELECT * FROM products WHERE product_id = :product_id', {
				replacements: {
					product_id: req.params.id,
				},
				type: sequelize.QueryTypes.SELECT,
			});

			res.status(201).json(products);
		} else {
			const products = await sequelize.query(
				'SELECT * FROM products WHERE product_id = :product_id AND is_disabled = "false"',
				{
					replacements: {
						product_id: req.params.id,
					},
					type: sequelize.QueryTypes.SELECT,
				}
			);

			res.status(201).json(products);
		}
	} catch (err) {
		console.log(err);
		res.status(500).json({ message: 'Algo salio mal y no se pudo realizar el request de productos' });
	}
});

router.post('/', validateToken, async (req, res) => {
	try {
		const { is_admin, is_disabled } = req.token_info;

		if (is_admin && !is_disabled) {
			const { image_url, title, price, prod_description } = req.body;

			const newProduct = sequelize.query(
				'INSERT INTO products (image_url, title, price, prod_description) VALUES (:image_url, :title, :price, :prod_description)',
				{
					replacements: {
						image_url,
						title,
						price,
						prod_description,
					},
				}
			);

			res.status(201).json({ message: `Se ha creado con exito el producto ${title}` });
		} else {
			res.status(403).json({
				message:
					'Tu usuario no puede crear nuevos productos debido a que no es administrador o se encuentra desabilitado',
			});
		}
	} catch (err) {
		console.log(err);
		res.status(500).json({ message: 'Algo salio mal, no se pudo crear el producto' });
	}
});

router.put('/:id', validateToken, (req, res) => {
	try {
		if (!req.body) {
			res.status(400).json({ message: 'No se definieron los parametros a modificar' });
		}

		const { is_admin, is_disabled } = req.token_info;

		if (is_admin && !is_disabled) {
			const { image_url, title, price, prod_description, is_disabled } = req.body;

			const changeProduct = sequelize.query(
				`UPDATE products SET image_url = :image_url, title = :title, price = :price, prod_description = :prod_description, is_disabled = :is_disabled WHERE product_id = ${req.params.id}`,
				{
					replacements: {
						image_url,
						title,
						price,
						prod_description,
						is_disabled,
					},
				}
			);

			res.status(201).json({ message: `Se ha modificado con exito el producto ${req.params.id}` });
		} else {
			res
				.status(403)
				.json({ message: 'Tu usuario se encuentra desabilitado o no tiene permisos para modificar productos.' });
		}
	} catch (err) {
		console.log(err);
		res.status(500).json({ message: 'Algo salio mal, no se pudo modificar el producto' });
	}
});

router.delete('/:id', validateToken, validateProductId, async (req, res) => {
	try {
		const { is_admin, is_disabled } = req.token_info;

		if (is_admin && !is_disabled) {
			const disableProduct = await sequelize.query(
				`UPDATE products SET is_disabled = true WHERE product_id = ${req.params.id}`
			);

			res.status(201).json({ message: `Se ha desabilitado el producto con id = ${req.params.id}` });
		} else {
			res
				.status(403)
				.json({ message: 'Tu usuario se encuentra desabilitado o no tiene permisos para modificar productos.' });
		}
	} catch (err) {
		console.log(err);
		res.status(500).json({ message: 'Algo salio mal, no se pudo dar de baja el producto' });
	}
});

module.exports = router;
