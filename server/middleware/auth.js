const jwt = require('jsonwebtoken')
const User = require('../models/User')

// Protect routes
exports.protect = async (req, res, next) => {

	let token
	
	if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
		token = req.headers.authorization.split(' ')[1]
	}

	// Assicurati che il token esista
	if (!token || token == 'null') {
		return res.status(401).json({ success: false, message: 'Non autorizzato ad accedere a questa rotta' })
	}

	try {
		// Verifica il token
		const decoded = jwt.verify(token, process.env.JWT_SECRET)
		console.log(decoded)
		req.user = await User.findById(decoded.id)
		next()
	} catch (err) {
		console.log(err.stack)
		return res.status(401).json({ success: false, message: 'Non autorizzato ad accedere a questa rotta' })
	}
}

// Concedi l'accesso a ruoli specifici
exports.authorize = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return res.status(403).json({
				success: false,
				message: `Il ruolo utente ${req.user.role} non è autorizzato ad accedere a questa rotta`
			})
		}
		next()
	}
}
