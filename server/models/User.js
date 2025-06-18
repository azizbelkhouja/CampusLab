const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		unique: true,
		required: [true, 'Aggiungi un nome utente']
	},
	email: {
		type: String,
		required: [true, 'Aggiungi un\'email'],
		unique: true,
		match: [
			/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
			'Aggiungi un\'email valida'
		]
	},
	role: {
		type: String,
		enum: ['user', 'admin'],
		defalut: 'user'
	},
	password: {
		type: String,
		required: [true, 'Aggiungi una password'],
		minlength: 6,
		select: false
	},
	tickets: [
		{
			showtime: { type: mongoose.Schema.ObjectId, ref: 'Showtime' },
			seats: [
				{
					row: { type: String },
					number: { type: Number }
				}
			]
		}
	],
	createdAt: {
		type: Date,
		default: Date.now
	}
})

//Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
	const salt = await bcrypt.genSalt(10)
	this.password = await bcrypt.hash(this.password, salt)
})

//Sign JWT and return
userSchema.methods.getSignedJwtToken = function () {
	return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRE
	})
}

//Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password)
}

module.exports = mongoose.model('User', userSchema)
