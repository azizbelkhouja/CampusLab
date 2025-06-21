

const Dip = require('../models/Dip')
const Aula = require('../models/Aula')

// restituisce la lista di tutte le aule dal database
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

// restituisce un'aula specifica dal database
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
			return res.status(400).json({ success: false, message: `Aula non trovata con id ${req.params.id}` })
		}

		res.status(200).json({ success: true, data: aula })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

// restituisce un'aula non pubblicata specifica dal database
exports.getUnreleasedAula = async (req, res, next) => {
	try {
		const aula = await Aula.findById(req.params.id).populate([
			{ path: 'showtimes', select: 'seminario showtime isRelease' },
			{ path: 'dip', select: 'name' }
		])

		if (!aula) {
			return res.status(400).json({ success: false, message: `Aula non trovata con id ${req.params.id}` })
		}

		res.status(200).json({ success: true, data: aula })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

// restituisce le aule per un seminario specifico in una data specifica
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

		exports.createAula = async (req, res, next) => {
		try {
			const { dip: dipId, row, column } = req.body
			const rowRegex = /^([A-D][A-Z]|[A-Z])$/
			if (!rowRegex.test(row)) {
				return res.status(400).json({ success: false, message: `Riga non è una lettera fra A e CZ` })
			}

			if (column < 1 || column > 120) {
				return res.status(400).json({ success: false, message: `Colonna non è un numero fra 1 e 250` })
			}

			const dip = await Dip.findById(dipId)

			if (!dip) {
				return res.status(400).json({ success: false, message: `Dip non trovato con id ${dipId}` })
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

		exports.updateAula = async (req, res, next) => {
		try {
			const aula = await Aula.findByIdAndUpdate(req.params.id, req.body, {
				new: true,
				runValidators: true
			})

			if (!aula) {
				return res.status(400).json({ success: false, message: `Aula non trovata con id ${req.params.id}` })
			}
			res.status(200).json({ success: true, data: aula })
		} catch (err) {
			res.status(400).json({ success: false, message: err })
		}
		}

		exports.deleteAula = async (req, res, next) => {
		try {
			const aula = await Aula.findById(req.params.id)

			if (!aula) {
				return res.status(400).json({ success: false, message: `Aula non trovata con id ${req.params.id}` })
			}

			await aula.deleteOne()

			await Lab.updateMany({ aulas: aula._id }, { $pull: { aulas: aula._id } })

			res.status(200).json({ success: true })
		} catch (err) {
			res.status(400).json({ success: false, message: err })
		}
	}

}

// restituisce le aule non pubblicate per un seminario specifico in una data specifica
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

// crea una nuova aula nel database
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
			return res.status(400).json({ success: false, message: `Dip non trovata con id ${dipId}` })
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

// aggiorna un'aula esistente nel database
exports.updateAula = async (req, res, next) => {
	try {
		const aula = await Aula.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true
		})

		if (!aula) {
			return res.status(400).json({ success: false, message: `Aula non trovata con id ${req.params.id}` })
		}
		res.status(200).json({ success: true, data: aula })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

// elimina un'aula esistente dal database
exports.deleteAula = async (req, res, next) => {
	try {
		const aula = await Aula.findById(req.params.id)

		if (!aula) {
			return res.status(400).json({ success: false, message: `Aula non trovata con id ${req.params.id}` })
		}

		await aula.deleteOne()

		await Dip.updateMany({ aulas: aula._id }, { $pull: { aulas: aula._id } })

		res.status(200).json({ success: true })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}
