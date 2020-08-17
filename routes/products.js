const express = require('express');
const router = express.Router();

const sequelize = require('../db');

router.get('/', (req, res) => {
	sequelize.query('SELECT * FROM products', { type: sequelize.QueryTypes.SELECT }).then((resultados) => {
		res.send(resultados);
	});
});

router.post('/', (req, res) => {
	sequelize
		.query(
			'INSERT INTO products (image_url, title, price, prod_description) VALUES (:image_url, :title, :price, :prod_description)',
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
			res.status(201).send(`Se ha creado con exito el producto ${req.body.title}`);
		})
		.catch((err) => {
			console.log(err);
			res.status(500).send('Algo salio mal, no se pudo crear el producto');
		});
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
