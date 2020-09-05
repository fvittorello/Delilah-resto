const express = require('express');
const router = express.Router();
const sequelize = require('../db');
const { validateToken } = require('../services/jwt.services');

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
		res.status(500).json('Algo salio mal y no se pudo realizar el request de productos');
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

			res.status(201).json(`Se ha creado con exito el producto ${title}`);
		} else {
			res
				.status(403)
				.json(
					'Tu usuario no puede crear nuevos productos debido a que no es administrador o se encuentra desabilitado'
				);
		}
	} catch (err) {
		console.log(err);
		res.status(500).json('Algo salio mal, no se pudo crear el producto');
	}
});

router.patch('/:id', (req, res) => {
	if (!req.body) {
		res.status(400).send('No se definieron los parametros a modificar');
	}
	sequelize
		.query(
			`UPDATE products SET image_url = :image_url, title = :title, price = :price, prod_description = :prod_description WHERE product_id = ${req.params.id}`,
			{
				replacements: {
					image_url: req.body.image_url,
					title: req.body.title,
					price: req.body.price,
					prod_description: req.body.prod_description,
				},
			}
		)
		.then(() => {
			res.status(201).send(`Se ha modificado con exito el producto ${req.params.id}`);
		})
		.catch((err) => {
			console.log(err);
			res.status(500).send('Algo salio mal, no se pudo modificar el producto');
		});
});

module.exports = router;
