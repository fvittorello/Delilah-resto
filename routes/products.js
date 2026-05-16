const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const sequelize = require('../db/db');
const { validateToken } = require('../services/jwt.services');
const { validateProductId } = require('../services/db.services');

function checkValidation(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
	next();
}

const validateId = [
	param('id').isInt({ min: 1 }).withMessage('El id debe ser un número entero positivo.'),
	checkValidation,
];

const productBodyRules = [
	body('title').notEmpty().withMessage('El título del producto es requerido.'),
	body('price').isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo.'),
	body('image_url').notEmpty().withMessage('La URL de imagen es requerida.'),
	checkValidation,
];

router.get('/', validateToken, async (req, res) => {
	try {
		const { is_admin, is_disabled } = req.token_info;

		if (is_admin && !is_disabled) {
			const products = await sequelize.query('SELECT * FROM products', { type: sequelize.QueryTypes.SELECT });
			return res.status(200).json(products);
		}

		const products = await sequelize.query('SELECT * FROM products WHERE is_disabled = false', {
			type: sequelize.QueryTypes.SELECT,
		});
		res.status(200).json(products);
	} catch (err) {
		res.status(500).json({ message: 'Algo salio mal y no se pudo realizar el request de productos.' });
	}
});

router.get('/:id', validateId, validateToken, validateProductId, async (req, res) => {
	try {
		const { is_admin, is_disabled } = req.token_info;

		if (is_admin && !is_disabled) {
			const products = await sequelize.query('SELECT * FROM products WHERE product_id = :product_id', {
				replacements: { product_id: req.params.id },
				type: sequelize.QueryTypes.SELECT,
			});
			return res.status(200).json(products);
		}

		const products = await sequelize.query(
			'SELECT * FROM products WHERE product_id = :product_id AND is_disabled = false',
			{
				replacements: { product_id: req.params.id },
				type: sequelize.QueryTypes.SELECT,
			}
		);
		res.status(200).json(products);
	} catch (err) {
		res.status(500).json({ message: 'Algo salio mal y no se pudo realizar el request de productos.' });
	}
});

router.post('/', validateToken, productBodyRules, async (req, res) => {
	try {
		const { is_admin, is_disabled } = req.token_info;

		if (!is_admin || is_disabled) {
			return res.status(403).json({
				message: 'Tu usuario no puede crear nuevos productos debido a que no es administrador o se encuentra desabilitado.',
			});
		}

		const { image_url, title, price, prod_description } = req.body;

		await sequelize.query(
			'INSERT INTO products (image_url, title, price, prod_description) VALUES (:image_url, :title, :price, :prod_description)',
			{
				replacements: { image_url, title, price, prod_description: prod_description || null },
			}
		);

		res.status(201).json({ message: `Se ha creado con exito el producto ${title}` });
	} catch (err) {
		res.status(500).json({ message: 'Algo salio mal, no se pudo crear el producto.' });
	}
});

router.put('/:id', validateId, validateToken, validateProductId, productBodyRules, async (req, res) => {
	try {
		const { is_admin, is_disabled: tokenDisabled } = req.token_info;

		if (!is_admin || tokenDisabled) {
			return res.status(403).json({ message: 'Tu usuario se encuentra desabilitado o no tiene permisos para modificar productos.' });
		}

		const { image_url, title, price, prod_description, is_disabled } = req.body;

		await sequelize.query(
			'UPDATE products SET image_url = :image_url, title = :title, price = :price, prod_description = :prod_description, is_disabled = :is_disabled WHERE product_id = :id',
			{
				replacements: {
					image_url,
					title,
					price,
					prod_description: prod_description || null,
					is_disabled: is_disabled !== undefined ? is_disabled : false,
					id: req.params.id,
				},
				type: sequelize.QueryTypes.UPDATE,
			}
		);

		res.status(200).json({ message: `Se ha modificado con exito el producto ${req.params.id}` });
	} catch (err) {
		res.status(500).json({ message: 'Algo salio mal, no se pudo modificar el producto.' });
	}
});

router.delete('/:id', validateId, validateToken, validateProductId, async (req, res) => {
	try {
		const { is_admin, is_disabled } = req.token_info;

		if (!is_admin || is_disabled) {
			return res.status(403).json({ message: 'Tu usuario se encuentra desabilitado o no tiene permisos para modificar productos.' });
		}

		await sequelize.query('UPDATE products SET is_disabled = true WHERE product_id = :id', {
			replacements: { id: req.params.id },
			type: sequelize.QueryTypes.UPDATE,
		});

		res.status(200).json({ message: `Se ha desabilitado el producto con id = ${req.params.id}` });
	} catch (err) {
		res.status(500).json({ message: 'Algo salio mal, no se pudo dar de baja el producto.' });
	}
});

module.exports = router;
