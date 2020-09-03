const jwt = require('jsonwebtoken');

function generateToken(info) {
	const token = jwt.sign(info, process.env.TOKEN_SECRET);
	console.log(`token generado ${token}`);
	return token;
}

async function validateToken(req, res, next) {
	const token = req.headers.authorization.split(' ')[1];

	try {
		const validation = jwt.verify(token, process.env.TOKEN_SECRET);
		next();
	} catch (err) {
		res.status(401).send('Usuario sin autorización o token expirado');
	}
}

module.exports = { generateToken, validateToken };
