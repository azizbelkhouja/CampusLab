const mongoose = require('mongoose')

const aulaSchema = new mongoose.Schema({
	dip: { type: mongoose.Schema.ObjectId, ref: 'Dip' },
	number: { type: Number, required: true },
	seatPlan: {
		row: {
			type: String,
			maxlength: 2,
			required: [true, 'Per favore aggiungi una riga']
		},
		column: {
			type: Number,
			required: [true, 'Per favore aggiungi una colonna']
		}
	},
	showtimes: [{ type: mongoose.Schema.ObjectId, ref: 'Showtime' }]
})

aulaSchema.pre('deleteOne', { document: true, query: true }, async function (next) {
	const showtimes = await this.model('Showtime').find({ _id: { $in: this.showtimes } })

	for (const showtime of showtimes) {
		await showtime.deleteOne()
	}
	next()
})

module.exports = mongoose.model('Aula', aulaSchema)
