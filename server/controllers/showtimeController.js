

const Seminario = require('../models/Seminario')
const Showtime = require('../models/Showtime')
const Aula = require('../models/Aula')
const User = require('../models/User')

exports.getShowtimes = async (req, res, next) => {
	try {
		const showtimes = await Showtime.find({ isRelease: true })
			.populate([
				'seminario',
				{ path: 'aula', populate: { path: 'dip', select: 'name' }, select: 'number dip seatPlan' }
			])
			.select('-seats.user -seats.row -seats.number')

		res.status(200).json({ success: true, count: showtimes.length, data: showtimes })
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false, message: err })
	}
}

exports.getUnreleasedShowtimes = async (req, res, next) => {
	try {
		const showtimes = await Showtime.find()
			.populate([
				'seminario',
				{ path: 'aula', populate: { path: 'dip', select: 'name' }, select: 'number dip seatPlan' }
			])
			.select('-seats.user -seats.row -seats.number')

		res.status(200).json({ success: true, count: showtimes.length, data: showtimes })
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false, message: err })
	}
}

exports.getShowtime = async (req, res, next) => {
	try {
		const showtime = await Showtime.findById(req.params.id)
			.populate([
				'seminario',
				{ path: 'aula', populate: { path: 'dip', select: 'name' }, select: 'number dip seatPlan' }
			])
			.select('-seats.user')

		if (!showtime) {
			return res.status(400).json({ success: false, message: `Showtime non trovato con id ${req.params.id}` })
		}

		if (!showtime.isRelease) {
			return res.status(400).json({ success: false, message: `Showtime non è pubblicato` })
		}

		res.status(200).json({ success: true, data: showtime })
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false, message: err })
	}
}

exports.getShowtimeWithUser = async (req, res, next) => {
	try {
		const showtime = await Showtime.findById(req.params.id).populate([
			'seminario',
			{ path: 'aula', populate: { path: 'dip', select: 'name' }, select: 'number dip seatPlan' },
			{ path: 'seats', populate: { path: 'user', select: 'username email role' } }
		])

		if (!showtime) {
			return res.status(400).json({ success: false, message: `Showtime non trovato con id ${req.params.id}` })
		}

		res.status(200).json({ success: true, data: showtime })
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false, message: err })
	}
}

exports.addShowtime = async (req, res, next) => {
	try {
		const { seminario: seminarioId, showtime: showtimeString, aula: aulaId, repeat = 1, isRelease } = req.body

		if (repeat > 31 || repeat < 1) {
			return res.status(400).json({ success: false, message: `Repeat non è un numero valido tra 1 e 31` })
		}

		let showtime = new Date(showtimeString)
		let showtimes = []
		let showtimeIds = []

		const aula = await Aula.findById(aulaId)

		if (!aula) {
			return res.status(400).json({ success: false, message: `Aula non trovata con id ${req.params.id}` })
		}

		const seminario = await Seminario.findById(seminarioId)

		if (!seminario) {
			return res.status(400).json({ success: false, message: `Seminario non trovato con id ${seminarioId}` })
		}

		for (let i = 0; i < repeat; i++) {
			const showtimeDoc = await Showtime.create({ aula, seminario: seminario._id, showtime, isRelease })

			showtimeIds.push(showtimeDoc._id)
			showtimes.push(new Date(showtime))
			showtime.setDate(showtime.getDate() + 1)
		}
		aula.showtimes = aula.showtimes.concat(showtimeIds)

		await aula.save()

		res.status(200).json({
			success: true,
			showtimes: showtimes
		})
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false, message: err })
	}
}

exports.purchase = async (req, res, next) => {
	try {
		const { seats } = req.body
		const user = req.user

		const showtime = await Showtime.findById(req.params.id).populate({ path: 'aula', select: 'seatPlan' })

		if (!showtime) {
			return res.status(400).json({ success: false, message: `Showtime non trovato con id ${req.params.id}` })
		}

		const isSeatValid = seats.every((seatNumber) => {
			const [row, number] = seatNumber.match(/([A-Za-z]+)(\d+)/).slice(1)
			const maxRow = showtime.aula.seatPlan.row
			const maxCol = showtime.aula.seatPlan.column

			if (maxRow.length !== row.length) {
				return maxRow.length > row.length
			}

			return maxRow.localeCompare(row) >= 0 && number <= maxCol
		})

		if (!isSeatValid) {
			return res.status(400).json({ success: false, message: 'Posto non valido' })
		}

		const isSeatAvailable = seats.every((seatNumber) => {
			const [row, number] = seatNumber.match(/([A-Za-z]+)(\d+)/).slice(1)
			return !showtime.seats.some((seat) => seat.row === row && seat.number === parseInt(number, 10))
		})

		if (!isSeatAvailable) {
			return res.status(400).json({ success: false, message: 'Posto non disponibile' })
		}

		const seatUpdates = seats.map((seatNumber) => {
			const [row, number] = seatNumber.match(/([A-Za-z]+)(\d+)/).slice(1)
			return { row, number: parseInt(number, 10), user: user._id }
		})

		showtime.seats.push(...seatUpdates)
		const updatedShowtime = await showtime.save()

		const updatedUser = await User.findByIdAndUpdate(
			user._id,
			{
				$push: { tickets: { showtime, seats: seatUpdates } }
			},
			{ new: true }
		)

		res.status(200).json({ success: true, data: updatedShowtime, updatedUser })
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false, message: err })
	}
}

exports.updateShowtime = async (req, res, next) => {
	try {
		const showtime = await Showtime.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true
		})

		if (!showtime) {
			return res.status(400).json({ success: false, message: `Showtime non trovato con id ${req.params.id}` })
		}
		res.status(200).json({ success: true, data: showtime })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

exports.deleteShowtime = async (req, res, next) => {
	try {
		const showtime = await Showtime.findById(req.params.id)

		if (!showtime) {
			return res.status(400).json({ success: false, message: `Showtime non trovato con id ${req.params.id}` })
		}

		await showtime.deleteOne()

		res.status(200).json({ success: true })
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false, message: err })
	}
}

exports.deleteShowtimes = async (req, res, next) => {
	try {
		const { ids } = req.body

		let showtimesIds

		if (!ids) {
			showtimesIds = await Showtime.find({}, '_id')
		} else {
			showtimesIds = await Showtime.find({ _id: { $in: ids } }, '_id')
		}

		for (const showtimeId of showtimesIds) {
			await showtimeId.deleteOne()
		}

		res.status(200).json({ success: true, count: showtimesIds.length })
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false, message: err })
	}
}

exports.deletePreviousShowtime = async (req, res, next) => {
	try {
		const currentDate = new Date()
		currentDate.setHours(0, 0, 0, 0)

		const showtimesIds = await Showtime.find({ showtime: { $lt: currentDate } }, '_id')

		for (const showtimeId of showtimesIds) {
			await showtimeId.deleteOne()
		}

		res.status(200).json({ success: true, count: showtimesIds.length })
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false, message: err })
	}
}
