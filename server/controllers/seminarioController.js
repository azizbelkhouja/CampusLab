const Seminario = require('../models/Seminario')
const Showtime = require('../models/Showtime')

//@desc     GET all seminarios
//@route    GET /seminario
//@access   Public
exports.getSeminari = async (req, res, next) => {
	try {
		const seminari = await Seminario.find().sort({ createdAt: -1 })
		res.status(200).json({ success: true, count: seminari.length, data: seminari })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     GET showing seminarios
//@route    GET /seminario/showing
//@access   Public
exports.getShowingSeminari = async (req, res, next) => {
	try {
		const showingShowtime = await Showtime.aggregate([
			{ $match: { showtime: { $gte: new Date() }, isRelease: true } },
			{
				$lookup: {
					from: 'seminarios', // Replace "seminari" with the actual collection name of your seminari
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
//@desc     GET showing seminari with all unreleased showtime
//@route    GET /seminario/unreleased/showing
//@access   Private admin
exports.getUnreleasedShowingSeminari = async (req, res, next) => {
	try {
		const showingShowtime = await Showtime.aggregate([
			{ $match: { showtime: { $gte: new Date() }, isRelease: true } },
			{
				$lookup: {
					from: 'seminarios', // Replace "seminari" with the actual collection name of your seminari
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

//@desc     GET single seminario
//@route    GET /seminario/:id
//@access   Public
exports.getSeminario = async (req, res, next) => {
	try {
		const seminario = await Seminario.findById(req.params.id)

			if (!seminario) {
				return res.status(400).json({ success: false, message: `Seminario not found with id of ${req.params.id}` })
			}

		res.status(200).json({ success: true, data: seminario })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     Create seminario
//@route    POST /seminario
//@access   Private
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

//@desc     Update seminarios
//@route    PUT /seminario/:id
//@access   Private Admin
exports.updateSeminario = async (req, res, next) => {
	try {
		const seminario = await Seminario.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true
		})

		if (!seminario) {
			return res.status(400).json({ success: false, message: `Seminario not found with id of ${req.params.id}` })
		}
		res.status(200).json({ success: true, data: seminario })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     Delete single seminario
//@route    DELETE /seminario/:id
//@access   Private Admin
exports.deleteSeminario = async (req, res, next) => {
	try {
		const seminario = await Seminario.findById(req.params.id)

		if (!seminario) {
			return res.status(400).json({ success: false, message: `Seminario not found with id of ${req.params.id}` })
		}

		await seminario.deleteOne()
		res.status(200).json({ success: true })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}