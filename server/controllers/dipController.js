

const Dip = require('../models/Dip')

exports.getDips = async (req, res, next) => {
	try {
		const dips = await Dip.find()
			.populate({
				path: 'aulas',
				populate: {
					path: 'showtimes',
					populate: { path: 'seminario', select: 'name length' },
					select: 'seminario showtime isRelease'
				},
				select: 'number seatPlan showtimes'
			})
			.collation({ locale: 'en', strength: 2 })
			.sort({ name: 1 })
			.then((dips) => {
				dips.forEach((dip) => {
					dip.aulas.forEach((aula) => {
						aula.showtimes = aula.showtimes.filter((showtime) => showtime.isRelease)
					})
				})
				return dips
			})

		res.status(200).json({ success: true, count: dips.length, data: dips })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

exports.getUnreleasedDips = async (req, res, next) => {
	try {
		const dips = await Dip.find()
			.populate({
				path: 'aulas',
				populate: {
					path: 'showtimes',
					populate: { path: 'seminario', select: 'name length' },
					select: 'seminario showtime isRelease'
				},
				select: 'number seatPlan showtimes'
			})
			.collation({ locale: 'en', strength: 2 })
			.sort({ name: 1 })

		res.status(200).json({ success: true, count: dips.length, data: dips })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

exports.getDip = async (req, res, next) => {
	try {
		const dip = await Dip.findById(req.params.id)
			.populate({
				path: 'aulas',
				populate: {
					path: 'showtimes',
					populate: { path: 'seminario', select: 'name length' },
					select: 'seminario showtime isRelease'
				},
				select: 'number seatPlan showtimes'
			})
			.then((dips) => {
				dips.forEach((dip) => {
					dip.aulas.forEach((aula) => {
						aula.showtimes = aula.showtimes.filter((showtime) => showtime.isRelease)
					})
				})
				return dips
			})

		if (!dip) {
			return res.status(400).json({ success: false, message: `Dip non trovato con id ${req.params.id}` })
		}

		res.status(200).json({ success: true, data: dip })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

exports.createDip = async (req, res, next) => {
	try {
		const dip = await Dip.create(req.body)
		res.status(201).json({
			success: true,
			data: dip
		})
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

exports.updateDip = async (req, res, next) => {
	try {
		const dip = await Dip.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true
		})

		if (!dip) {
			return res.status(400).json({ success: false, message: `Dip non trovato con id ${req.params.id}` })
		}
		res.status(200).json({ success: true, data: dip })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

exports.deleteDip = async (req, res, next) => {
	try {
		const dip = await Dip.findById(req.params.id)

		if (!dip) {
			return res.status(400).json({ success: false, message: `Dip non trovato con id ${req.params.id}` })
		}

		await dip.deleteOne()

		res.status(200).json({ success: true })
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false, message: err })
	}
}
