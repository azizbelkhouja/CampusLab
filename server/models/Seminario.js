const mongoose = require('mongoose')

const seminarioSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Please add a seminario name'],
			trim: true
		},
		length: {
			type: Number,
			required: [true, 'Please add a seminario length']
		},
		img: {
			type: String,
			required: [true, 'Please add a seminario img'],
			trim: true
		}
	},
	{ timestamps: true }
)

seminarioSchema.pre('deleteOne', { document: true, query: true }, async function (next) {
	const seminarioId = this._id
	const showtimes = await this.model('Showtime').find({ seminario: seminarioId })

	for (const showtime of showtimes) {
		await showtime.deleteOne()
	}
	next()
})

module.exports = mongoose.model('Seminario', seminarioSchema)
