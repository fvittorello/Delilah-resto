const express = require('express');
const router = express.Router();
const Joi = require('@hapi/joi');
const bcrypt = require('bcryptjs');

//	Register Validation
const registerValidation = (data) => {
	const schema = {
		username: Joi.string().min(6).required(),
		email: Joi.string().min(6).required().email(),
		password: Joi.string().min(6).required(),
	};

	return Joi.validate(data, schema);
};

//	Joi Example
router.post('/register', async (req, res) => {
	//	Validation
	const { error } = registerValidation(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	//	Check if the email already exists in the db
	const emailExist = await User.findOne({ email: req.body.email });
	if (emailExist) return res.status(400).send('Email already exists');

	//	Hash password
	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(req.body.password, salt);

	const user = new user({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
	});

	try {
		const savedUser = await user.save();
		res.send(savedUser);
	} catch (err) {
		res.status(400).send(err);
	}
});

module.exports.registerValidation = registerValidation;
