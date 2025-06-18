const Dip = require('../models/Dip')

//@desc     GET all Dips
//@route    GET /Dip
//@access   Public
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

//@desc     GET all dips with all unreleased showtime
//@route    GET /dip/unreleased
//@access   Private admin
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

//@desc     GET single dip
//@route    GET /dip/:id
//@access   Public
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
			return res.status(400).json({ success: false, message: `Dip not found with id of ${req.params.id}` })
		}

		res.status(200).json({ success: true, data: dip })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     Create dip
//@route    POST /dip
//@access   Private
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

//@desc     Update dips
//@route    PUT /dip/:id
//@access   Private Admin
exports.updateDip = async (req, res, next) => {
	try {
		const dip = await Dip.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true
		})

		if (!dip) {
			return res.status(400).json({ success: false, message: `Dip not found with id of ${req.params.id}` })
		}
		res.status(200).json({ success: true, data: dip })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     Delete single dip
//@route    DELETE /dip/:id
//@access   Private Admin
exports.deleteDip = async (req, res, next) => {
	try {
		const dip = await Dip.findById(req.params.id)

		if (!dip) {
			return res.status(400).json({ success: false, message: `Dip not found with id of ${req.params.id}` })
		}

		await dip.deleteOne()

		res.status(200).json({ success: true })
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false, message: err })
	}
}
