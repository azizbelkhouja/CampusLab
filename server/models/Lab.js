const mongoose = require('mongoose')

const labSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			trim: true,
			unique: true,
			required: [true, 'Aggiungi un nome']
		},
		theaters: [{ type: mongoose.Schema.ObjectId, ref: 'Theater' }]
	},
	{ timestamps: true }
)

labSchema.pre('deleteOne', { document: true, query: true }, async function (next) {
	// Remove theaters associated with the lab being deleted
	const theaters = await this.model('Theater').find({ _id: { $in: this.theaters } })

	for (const theater of theaters) {
		await theater.deleteOne()
	}
	next()
})

module.exports = mongoose.model('Lab', labSchema)
