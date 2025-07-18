

const User = require('../models/User')

exports.register = async (req, res, next) => {
	try {
		const { username, email, password, role = 'user' } = req.body

		const user = await User.create({
			username,
			email,
			password,
			role
		})

		sendTokenResponse(user, 200, res)
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

exports.login = async (req, res, next) => {
	try {
		const { username, password } = req.body

		if (!username || !password) {
			return res.status(400).json('Per favore fornisci un nome utente e una password')
		}

		const user = await User.findOne({ username }).select('+password')

		if (!user) {
			return res.status(400).json('Credenziali non valide')
		}

		const isMatch = await user.matchPassword(password)

		if (!isMatch) {
			return res.status(401).json('Credenziali non valide')
		}

		sendTokenResponse(user, 200, res)
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

const sendTokenResponse = (user, statusCode, res) => {
	
	const token = user.getSignedJwtToken()

	const options = {
		expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
		httpOnly: true
	}

	if (process.env.NODE_ENV === 'production') {
		options.secure = true
	}
	res.status(statusCode).cookie('token', token, options).json({
		success: true,
		token
	})
}

exports.getMe = async (req, res, next) => {
	try {
		const user = await User.findById(req.user.id)
		res.status(200).json({
			success: true,
			data: user
		})
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

exports.getTickets = async (req, res, next) => {
	try {
		const user = await User.findById(req.user.id, { tickets: 1 }).populate({
			path: 'tickets.showtime',
			populate: [
				'seminario',
				{ path: 'aula', populate: { path: 'dip', select: 'name' }, select: 'numero dipartimento' }
			],
			select: 'aula seminario showtime isRelease'
		})

		res.status(200).json({
			success: true,
			data: user
		})
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

exports.logout = async (req, res, next) => {
	try {
		res.cookie('token', 'none', {
			expires: new Date(Date.now() + 10 * 1000),
			httpOnly: true
		})

		res.status(200).json({
			success: true
		})
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

exports.getAll = async (req, res, next) => {
	try {
		const user = await User.find().populate({
			path: 'tickets.showtime',
			populate: [
				'seminario',
				{ path: 'aula', populate: { path: 'dip', select: 'name' }, select: 'dip numero' }
			],
			select: 'aula seminario showtime isRelease'
		})

		res.status(200).json({
			success: true,
			data: user
		})
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

exports.deleteUser = async (req, res, next) => {
	try {
		const user = await User.findByIdAndDelete(req.params.id)

		if (!user) {
			return res.status(400).json({ success: false })
		}
		res.status(200).json({ success: true })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

exports.updateUser = async (req, res, next) => {
	try {
		const user = await User.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true
		})

		if (!user) {
			return res.status(400).json({ success: false, message: `User non trovato con id ${req.params.id}` })
		}
		res.status(200).json({ success: true, data: user })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}
