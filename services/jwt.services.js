const jwt = require('jsonwebtoken');

function generateToken(info) {
	const token = jwt.sign({ info }, process.env.TOKEN_SECRET, { expiresIn: '1h' });
	return token;
}

async function validateToken(req, res, next) {
	const token = req.headers.authorization.split(' ')[1];

	try {
		const validation = jwt.verify(token, process.env.TOKEN_SECRET);
		req.token_info = validation.info;
		next();
	} catch (err) {
		res.status(401).json({ message: 'Token invalido o expirado' });
	}
}

module.exports = { generateToken, validateToken };
