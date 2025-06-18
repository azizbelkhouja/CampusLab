const mongoose = require('mongoose')

const dipSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			trim: true,
			unique: true,
			required: [true, 'Aggiungi un nome']
		},
		aulas: [{ type: mongoose.Schema.ObjectId, ref: 'Aula' }]
	},
	{ timestamps: true }
)

dipSchema.pre('deleteOne', { document: true, query: true }, async function (next) {
	// Remove aulas associated with the dip being deleted
	const aulas = await this.model('Aula').find({ _id: { $in: this.aulas } })

	for (const aula of aulas) {
		await aula.deleteOne()
	}
	next()
})

module.exports = mongoose.model('Dip', dipSchema)