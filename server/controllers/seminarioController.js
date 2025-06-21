

const Seminario = require('../models/Seminario')
const Showtime = require('../models/Showtime')

exports.getSeminari = async (req, res, next) => {
	try {
		const seminari = await Seminario.find().sort({ createdAt: -1 })
		res.status(200).json({ success: true, count: seminari.length, data: seminari })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

exports.getShowingSeminari = async (req, res, next) => {
	try {
		const showingShowtime = await Showtime.aggregate([
			{ $match: { showtime: { $gte: new Date() }, isRelease: true } },
			{
				$lookup: {
					from: 'seminarios',
					localField: 'seminario',
					foreignField: '_id',
					as: 'seminario'
				}
			},
			{
				$group: {
					_id: '$seminario',
					count: { $sum: 1 }
				}
			},
			{
				$unwind: '$_id'
			},
			{
				$replaceRoot: {
					newRoot: {
						$mergeObjects: ['$$ROOT', '$_id']
					}
				}
			},
			{
				$sort: { count: -1 }
			}
		])

		res.status(200).json({ success: true, data: showingShowtime })
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false, message: err })
	}
}

exports.getUnreleasedShowingSeminari = async (req, res, next) => {
	try {
		const showingShowtime = await Showtime.aggregate([
			{ $match: { showtime: { $gte: new Date() }, isRelease: true } },
			{
				$lookup: {
					from: 'seminarios',
					localField: 'seminario',
					foreignField: '_id',
					as: 'seminario'
				}
			},
			{
				$group: {
					_id: '$seminario',
					count: { $sum: 1 }
				}
			},
			{
				$unwind: '$_id'
			},
			{
				$replaceRoot: {
					newRoot: {
						$mergeObjects: ['$$ROOT', '$_id']
					}
				}
			},
			{
				$sort: { count: -1, updatedAt: -1 }
			}
		])

		res.status(200).json({ success: true, data: showingShowtime })
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false, message: err })
	}
}

exports.getSeminario = async (req, res, next) => {
	try {
		const seminario = await Seminario.findById(req.params.id)

			if (!seminario) {
				return res.status(400).json({ success: false, message: `Seminario non trovato con id ${req.params.id}` })
			}

		res.status(200).json({ success: true, data: seminario })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

exports.createSeminario = async (req, res, next) => {
	try {
		const seminario = await Seminario.create(req.body)
		res.status(201).json({
			success: true,
			data: seminario
		})
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

exports.updateSeminario = async (req, res, next) => {
	try {
		const seminario = await Seminario.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true
		})

		if (!seminario) {
			return res.status(400).json({ success: false, message: `Seminario non trovato con id ${req.params.id}` })
		}
		res.status(200).json({ success: true, data: seminario })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

exports.deleteSeminario = async (req, res, next) => {
	try {
		const seminario = await Seminario.findById(req.params.id)

		if (!seminario) {
			return res.status(400).json({ success: false, message: `Seminario non trovato con id ${req.params.id}` })
		}

		await seminario.deleteOne()
		res.status(200).json({ success: true })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}