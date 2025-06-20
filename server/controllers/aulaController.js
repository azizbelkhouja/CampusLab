

const Dip = require('../models/Dip')
const Aula = require('../models/Aula')

//GET all aulas
//@route    GET /aula
//@access   Public
exports.getAulas = async (req, res, next) => {
	try {
		const aulas = await Aula.find()
			.populate([
				{ path: 'showtimes', select: 'seminario showtime isRelease' },
				{ path: 'dip', select: 'name' }
			])
			.then((aulas) => {
				aulas.forEach((aula) => {
					aula.showtimes = aula.showtimes.filter((showtime) => showtime.isRelease)
				})
				return aulas
			})

		res.status(200).json({ success: true, count: aulas.length, data: aulas })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

//GET single aula
//@route GET /aula/:id
//@access Public
exports.getAula = async (req, res, next) => {
	try {
		const aula = await Aula.findById(req.params.id)
			.populate([
				{ path: 'showtimes', select: 'seminario showtime isRelease' },
				{ path: 'dip', select: 'name' }
			])
			.then((aula) => {
				aula.showtimes = aula.showtimes.filter((showtime) => showtime.isRelease)
				return aula
			})

		if (!aula) {
			return res.status(400).json({ success: false, message: `Aula not found with id of ${req.params.id}` })
		}

		res.status(200).json({ success: true, data: aula })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

//GET single aula with all unreleased showtime
//@route GET /aula/unreleased/:id
//@access Private admin
exports.getUnreleasedAula = async (req, res, next) => {
	try {
		const aula = await Aula.findById(req.params.id).populate([
			{ path: 'showtimes', select: 'seminario showtime isRelease' },
			{ path: 'dip', select: 'name' }
		])

		if (!aula) {
			return res.status(400).json({ success: false, message: `Aula not found with id of ${req.params.id}` })
		}

		res.status(200).json({ success: true, data: aula })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

//GET aulas by seminario and date
//@route GET /aula/seminario/:mid/:date/:timezone
//@access Public
exports.getAulaBySeminario = async (req, res, next) => {
	try {
		const { mid, date, timezone } = req.params
		let aulas = await Aula.find()
			.populate([
				{
					path: 'showtimes',
					populate: { path: 'seminario', select: 'name _id' },
					select: 'seminario showtime isRelease'
				},
				{ path: 'dip', select: 'name' }
			])
			.then((aulas) => {
				aulas.forEach((aula) => {
					aula.showtimes = aula.showtimes.filter((showtime) => showtime.isRelease)
				})
				return aulas
			})

		aulas = aulas.filter((aula) => {
			return aula.showtimes.some((showtime) => {
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
		res.status(200).json({ success: true, data: aulas })
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false, message: err })
	}
	//GET aulas by seminario and date with all unreleased showtime
	//@route GET /aula/seminario/unreleased/:mid/:date/:timezone
	//@access Private admin
	exports.getUnreleasedAulaBySeminario = async (req, res, next) => {
		try {
			const { mid, date, timezone } = req.params
			let aulas = await Aula.find().populate([
				{
					path: 'showtimes',
					populate: { path: 'seminario', select: 'name _id' },
					select: 'seminario showtime isRelease'
				},
				{ path: 'dip', select: 'name' }
			])

			aulas = aulas.filter((aula) => {
				return aula.showtimes.some((showtime) => {
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
			res.status(200).json({ success: true, data: aulas })
		} catch (err) {
			console.log(err)
			res.status(400).json({ success: false, message: err })
		}
	}

	//Create aula
	//@route POST /aula
	//@access Private
	exports.createAula = async (req, res, next) => {
		try {
			const { dip: dipId, row, column } = req.body
			const rowRegex = /^([A-D][A-Z]|[A-Z])$/
			if (!rowRegex.test(row)) {
				return res.status(400).json({ success: false, message: `Row is not a valid letter between A to CZ` })
			}

			if (column < 1 || column > 120) {
				return res.status(400).json({ success: false, message: `Column is not a valid number between 1 to 250` })
			}

			const dip = await Dip.findById(dipId)

			if (!dip) {
				return res.status(400).json({ success: false, message: `Dip not found with id of ${dipId}` })
			}

			const aula = await Aula.create({ dip, number: dip.aulas.length + 1, seatPlan: { row, column } })

			dip.aulas.push(aula._id)

			await dip.save()

			res.status(201).json({
				success: true,
				data: aula
			})
		} catch (err) {
			res.status(400).json({ success: false, message: err })
		}
	}

	//Update aulas
	//@route PUT /aula/:id
	//@access Private Admin
	exports.updateAula = async (req, res, next) => {
		try {
			const aula = await Aula.findByIdAndUpdate(req.params.id, req.body, {
				new: true,
				runValidators: true
			})

			if (!aula) {
				return res.status(400).json({ success: false, message: `Aula not found with id of ${req.params.id}` })
			}
			res.status(200).json({ success: true, data: aula })
		} catch (err) {
			res.status(400).json({ success: false, message: err })
		}
	}

	//Delete single aulas
	//@route DELETE /aula/:id
	//@access Private Admin
	exports.deleteAula = async (req, res, next) => {
		try {
			const aula = await Aula.findById(req.params.id)

			if (!aula) {
				return res.status(400).json({ success: false, message: `Aula not found with id of ${req.params.id}` })
			}

			await aula.deleteOne()

			await Lab.updateMany({ aulas: aula._id }, { $pull: { aulas: aula._id } })

			res.status(200).json({ success: true })
		} catch (err) {
			res.status(400).json({ success: false, message: err })
		}
	}

}

exports.getUnreleasedAulaBySeminario = async (req, res, next) => {
	try {
		const { mid, date, timezone } = req.params
		let aulas = await Aula.find().populate([
			{
				path: 'showtimes',
				populate: { path: 'seminario', select: 'name _id' },
				select: 'seminario showtime isRelease'
			},
			{ path: 'dip', select: 'name' }
		])

		aulas = aulas.filter((aula) => {
			return aula.showtimes.some((showtime) => {
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
		res.status(200).json({ success: true, data: aulas })
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false, message: err })
	}
}

//Create aula
//@route POST /aula
//@access Private
exports.createAula = async (req, res, next) => {
	try {
		const { dip: dipId, row, column } = req.body
		const rowRegex = /^([A-D][A-Z]|[A-Z])$/
		if (!rowRegex.test(row)) {
			return res.status(400).json({ success: false, message: `Row is not a valid letter between A to CZ` })
		}

		if (column < 1 || column > 120) {
			return res.status(400).json({ success: false, message: `Column is not a valid number between 1 to 250` })
		}

		const dip = await Dip.findById(dipId)

		if (!dip) {
			return res.status(400).json({ success: false, message: `Dip not found with id of ${dipId}` })
		}

		const aula = await Aula.create({ dip: dip, number: dip.aulas.length + 1, seatPlan: { row, column } })

		dip.aulas.push(aula._id)

		await dip.save()

		res.status(201).json({
			success: true,
			data: aula
		})
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

//Update aulas
//@route PUT /aula/:id
//@access Private Admin
exports.updateAula = async (req, res, next) => {
	try {
		const aula = await Aula.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true
		})

		if (!aula) {
			return res.status(400).json({ success: false, message: `Aula not found with id of ${req.params.id}` })
		}
		res.status(200).json({ success: true, data: aula })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

//Delete single aulas
//@route DELETE /aula/:id
//@access Private Admin
exports.deleteAula = async (req, res, next) => {
	try {
		const aula = await Aula.findById(req.params.id)

		if (!aula) {
			return res.status(400).json({ success: false, message: `Aula not found with id of ${req.params.id}` })
		}

		await aula.deleteOne()

		await Dip.updateMany({ aulas: aula._id }, { $pull: { aulas: aula._id } })

		res.status(200).json({ success: true })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}
