const mongoose = require('mongoose')

const showtimeSchema = new mongoose.Schema({
	aula: { type: mongoose.Schema.ObjectId, ref: 'Aula' },
	seminario: { type: mongoose.Schema.ObjectId, ref: 'Seminario' },
	showtime: Date,
	seats: [
		{
			row: { type: String, required: [true, 'Si prega di aggiungere una fila di posti'] },
			number: { type: Number, required: [true, 'Si prega di aggiungere un numero di posti'] },
			user: { type: mongoose.Schema.ObjectId, ref: 'User' }
		}
	],
	isRelease: Boolean
})

showtimeSchema.pre('deleteOne', { document: true, query: true }, async function (next) {
	const showtimeId = this._id
	await this.model('User').updateMany(
		{ 'tickets.showtime': showtimeId },
		{ $pull: { tickets: { showtime: showtimeId } } }
	)
	next()
})

module.exports = mongoose.model('Showtime', showtimeSchema)
