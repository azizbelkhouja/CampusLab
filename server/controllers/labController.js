const Lab = require('../models/Lab')

//@desc     GET all Labs
//@route    GET /Lab
//@access   Public
exports.getLabs = async (req, res, next) => {
	try {
		const labs = await Lab.find()
			.populate({
				path: 'theaters',
				populate: {
					path: 'showtimes',
					populate: { path: 'seminario', select: 'name length' },
					select: 'seminario showtime isRelease'
				},
				select: 'number seatPlan showtimes'
			})
			.collation({ locale: 'en', strength: 2 })
			.sort({ name: 1 })
			.then((labs) => {
				labs.forEach((lab) => {
					lab.theaters.forEach((theater) => {
						theater.showtimes = theater.showtimes.filter((showtime) => showtime.isRelease)
					})
				})
				return labs
			})

		res.status(200).json({ success: true, count: labs.length, data: labs })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     GET all labs with all unreleased showtime
//@route    GET /lab/unreleased
//@access   Private admin
exports.getUnreleasedLabs = async (req, res, next) => {
	try {
		const labs = await Lab.find()
			.populate({
				path: 'theaters',
				populate: {
					path: 'showtimes',
					populate: { path: 'seminario', select: 'name length' },
					select: 'seminario showtime isRelease'
				},
				select: 'number seatPlan showtimes'
			})
			.collation({ locale: 'en', strength: 2 })
			.sort({ name: 1 })

		res.status(200).json({ success: true, count: labs.length, data: labs })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     GET single lab
//@route    GET /lab/:id
//@access   Public
exports.getLab = async (req, res, next) => {
	try {
		const lab = await Lab.findById(req.params.id)
			.populate({
				path: 'theaters',
				populate: {
					path: 'showtimes',
					populate: { path: 'seminario', select: 'name length' },
					select: 'seminario showtime isRelease'
				},
				select: 'number seatPlan showtimes'
			})
			.then((labs) => {
				labs.forEach((lab) => {
					lab.theaters.forEach((theater) => {
						theater.showtimes = theater.showtimes.filter((showtime) => showtime.isRelease)
					})
				})
				return labs
			})

		if (!lab) {
			return res.status(400).json({ success: false, message: `Lab not found with id of ${req.params.id}` })
		}

		res.status(200).json({ success: true, data: lab })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     Create lab
//@route    POST /lab
//@access   Private
exports.createLab = async (req, res, next) => {
	try {
		const lab = await Lab.create(req.body)
		res.status(201).json({
			success: true,
			data: lab
		})
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     Update labs
//@route    PUT /lab/:id
//@access   Private Admin
exports.updateLab = async (req, res, next) => {
	try {
		const lab = await Lab.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true
		})

		if (!lab) {
			return res.status(400).json({ success: false, message: `Lab not found with id of ${req.params.id}` })
		}
		res.status(200).json({ success: true, data: lab })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     Delete single lab
//@route    DELETE /lab/:id
//@access   Private Admin
exports.deleteLab = async (req, res, next) => {
	try {
		const lab = await Lab.findById(req.params.id)

		if (!lab) {
			return res.status(400).json({ success: false, message: `Lab not found with id of ${req.params.id}` })
		}

		await lab.deleteOne()

		res.status(200).json({ success: true })
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false, message: err })
	}
}
