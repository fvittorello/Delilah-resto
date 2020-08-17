const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//  Login
router.post('/login', async (req, res) => {
	//  Validate the data before login the user
	const { error } = loginValidation(req.body, schema);
	if (error) return res.status(400).send(error.details[0].message);

	//	Check if the email already exists in the db
	const emailExist = await User.findOne({ email: req.body.email });
	if (!emailExist) return res.status(400).send('Email or password is wrong');

	//  Validate Password
	const validPass = await bcrypt.compare(req.body.password, user.password);
	if (!validPass) return res.status(400).send('Invalid password');

	//  Create and validate a JWT
	const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
	res.header('auth-token', token).send(token);
});
