const Lab = require('../models/Lab')
const Theater = require('../models/Theater')

//@desc     GET all theaters
//@route    GET /theater
//@access   Public
exports.getTheaters = async (req, res, next) => {
	try {
		const theaters = await Theater.find()
			.populate([
				{ path: 'showtimes', select: 'seminario showtime isRelease' },
				{ path: 'lab', select: 'name' }
			])
			.then((theaters) => {
				theaters.forEach((theater) => {
					theater.showtimes = theater.showtimes.filter((showtime) => showtime.isRelease)
				})
				return theaters
			})

		res.status(200).json({ success: true, count: theaters.length, data: theaters })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     GET single theater
//@route    GET /theater/:id
//@access   Public
exports.getTheater = async (req, res, next) => {
	try {
		const theater = await Theater.findById(req.params.id)
			.populate([
				{ path: 'showtimes', select: 'seminario showtime isRelease' },
				{ path: 'lab', select: 'name' }
			])
			.then((theater) => {
				theater.showtimes = theater.showtimes.filter((showtime) => showtime.isRelease)
				return theater
			})

		if (!theater) {
			return res.status(400).json({ success: false, message: `Theater not found with id of ${req.params.id}` })
		}

		res.status(200).json({ success: true, data: theater })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     GET single theater with all unreleased showtime
//@route    GET /theater/unreleased/:id
//@access   Private admin
exports.getUnreleasedTheater = async (req, res, next) => {
	try {
		const theater = await Theater.findById(req.params.id).populate([
			{ path: 'showtimes', select: 'seminario showtime isRelease' },
			{ path: 'lab', select: 'name' }
		])

		if (!theater) {
			return res.status(400).json({ success: false, message: `Theater not found with id of ${req.params.id}` })
		}

		res.status(200).json({ success: true, data: theater })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     GET theaters by seminario and date
//@route    GET /theater/seminario/:mid/:date/:timezone
//@access   Public
exports.getTheaterBySeminario = async (req, res, next) => {
	try {
		const { mid, date, timezone } = req.params
		let theaters = await Theater.find()
			.populate([
				{
					path: 'showtimes',
					populate: { path: 'seminario', select: 'name _id' },
					select: 'seminario showtime isRelease'
				},
				{ path: 'lab', select: 'name' }
			])
			.then((theaters) => {
				theaters.forEach((theater) => {
					theater.showtimes = theater.showtimes.filter((showtime) => showtime.isRelease)
				})
				return theaters
			})

		theaters = theaters.filter((theater) => {
			return theater.showtimes.some((showtime) => {
				const d1 = new Date(showtime.showtime)
				const d2 = new Date(date)
				d1.setTime(d1.getTime() - timezone * 60 * 1000)
				d2.setTime(d2.getTime() - timezone * 60 * 1000)
				return (
					showtime.seminario._id.equals(mid) &&
					d1.getUTCFullYear() === d2.getUTCFullYear() &&
					d1.getUTCMonth() === d2.getUTCMonth() &&
					d1.getUTCDate() === d2.getUTCDate()
				)
			})
		})
		res.status(200).json({ success: true, data: theaters })
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false, message: err })
	}
	//@desc     GET theaters by seminario and date with all unreleased showtime
	//@route    GET /theater/seminario/unreleased/:mid/:date/:timezone
	//@access   Private admin
	exports.getUnreleasedTheaterBySeminario = async (req, res, next) => {
		try {
			const { mid, date, timezone } = req.params
			let theaters = await Theater.find().populate([
				{
					path: 'showtimes',
					populate: { path: 'seminario', select: 'name _id' },
					select: 'seminario showtime isRelease'
				},
				{ path: 'lab', select: 'name' }
			])

			theaters = theaters.filter((theater) => {
				return theater.showtimes.some((showtime) => {
					const d1 = new Date(showtime.showtime)
					const d2 = new Date(date)
					d1.setTime(d1.getTime() - timezone * 60 * 1000)
					d2.setTime(d2.getTime() - timezone * 60 * 1000)
					return (
						showtime.seminario._id.equals(mid) &&
						d1.getUTCFullYear() === d2.getUTCFullYear() &&
						d1.getUTCMonth() === d2.getUTCMonth() &&
						d1.getUTCDate() === d2.getUTCDate()
					)
				})
			})
			res.status(200).json({ success: true, data: theaters })
		} catch (err) {
			console.log(err)
			res.status(400).json({ success: false, message: err })
		}
	}

	//@desc     Create theater
	//@route    POST /theater
	//@access   Private
	exports.createTheater = async (req, res, next) => {
		try {
			const { lab: labId, row, column } = req.body
			const rowRegex = /^([A-D][A-Z]|[A-Z])$/
			if (!rowRegex.test(row)) {
				return res.status(400).json({ success: false, message: `Row is not a valid letter between A to CZ` })
			}

			if (column < 1 || column > 120) {
				return res.status(400).json({ success: false, message: `Column is not a valid number between 1 to 250` })
			}

			const lab = await Lab.findById(labId)

			if (!lab) {
				return res.status(400).json({ success: false, message: `Lab not found with id of ${labId}` })
			}

			const theater = await Theater.create({ lab, number: lab.theaters.length + 1, seatPlan: { row, column } })

			lab.theaters.push(theater._id)

			await lab.save()

			res.status(201).json({
				success: true,
				data: theater
			})
		} catch (err) {
			res.status(400).json({ success: false, message: err })
		}
	}

	//@desc     Update theaters
	//@route    PUT /theater/:id
	//@access   Private Admin
	exports.updateTheater = async (req, res, next) => {
		try {
			const theater = await Theater.findByIdAndUpdate(req.params.id, req.body, {
				new: true,
				runValidators: true
			})

			if (!theater) {
				return res.status(400).json({ success: false, message: `Theater not found with id of ${req.params.id}` })
			}
			res.status(200).json({ success: true, data: theater })
		} catch (err) {
			res.status(400).json({ success: false, message: err })
		}
	}

	//@desc     Delete single theaters
	//@route    DELETE /theater/:id
	//@access   Private Admin
	exports.deleteTheater = async (req, res, next) => {
		try {
			const theater = await Theater.findById(req.params.id)

			if (!theater) {
				return res.status(400).json({ success: false, message: `Theater not found with id of ${req.params.id}` })
			}

			await theater.deleteOne()

			await Lab.updateMany({ theaters: theater._id }, { $pull: { theaters: theater._id } })

			res.status(200).json({ success: true })
		} catch (err) {
			res.status(400).json({ success: false, message: err })
		}
	}

}

exports.getUnreleasedTheaterBySeminario = async (req, res, next) => {
	try {
		const { mid, date, timezone } = req.params
		let theaters = await Theater.find().populate([
			{
				path: 'showtimes',
				populate: { path: 'seminario', select: 'name _id' },
				select: 'seminario showtime isRelease'
			},
			{ path: 'lab', select: 'name' }
		])

		theaters = theaters.filter((theater) => {
			return theater.showtimes.some((showtime) => {
				const d1 = new Date(showtime.showtime)
				const d2 = new Date(date)
				d1.setTime(d1.getTime() - timezone * 60 * 1000)
				d2.setTime(d2.getTime() - timezone * 60 * 1000)
				return (
					showtime.seminario._id.equals(mid) &&
					d1.getUTCFullYear() === d2.getUTCFullYear() &&
					d1.getUTCMonth() === d2.getUTCMonth() &&
					d1.getUTCDate() === d2.getUTCDate()
				)
			})
		})
		res.status(200).json({ success: true, data: theaters })
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     Create theater
//@route    POST /theater
//@access   Private
exports.createTheater = async (req, res, next) => {
	try {
		const { lab: labId, row, column } = req.body
		const rowRegex = /^([A-D][A-Z]|[A-Z])$/
		if (!rowRegex.test(row)) {
			return res.status(400).json({ success: false, message: `Row is not a valid letter between A to CZ` })
		}

		if (column < 1 || column > 120) {
			return res.status(400).json({ success: false, message: `Column is not a valid number between 1 to 250` })
		}

		const lab = await Lab.findById(labId)

		if (!lab) {
			return res.status(400).json({ success: false, message: `Lab not found with id of ${labId}` })
		}

		const theater = await Theater.create({ lab, number: lab.theaters.length + 1, seatPlan: { row, column } })

		lab.theaters.push(theater._id)

		await lab.save()

		res.status(201).json({
			success: true,
			data: theater
		})
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     Update theaters
//@route    PUT /theater/:id
//@access   Private Admin
exports.updateTheater = async (req, res, next) => {
	try {
		const theater = await Theater.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true
		})

		if (!theater) {
			return res.status(400).json({ success: false, message: `Theater not found with id of ${req.params.id}` })
		}
		res.status(200).json({ success: true, data: theater })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     Delete single theaters
//@route    DELETE /theater/:id
//@access   Private Admin
exports.deleteTheater = async (req, res, next) => {
	try {
		const theater = await Theater.findById(req.params.id)

		if (!theater) {
			return res.status(400).json({ success: false, message: `Theater not found with id of ${req.params.id}` })
		}

		await theater.deleteOne()

		await Lab.updateMany({ theaters: theater._id }, { $pull: { theaters: theater._id } })

		res.status(200).json({ success: true })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}
