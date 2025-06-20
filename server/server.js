const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const mongoose = require('mongoose')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
const xss = require('xss-clean')

require('dotenv').config()

const auth = require('./routes/auth')
const dip = require('./routes/dip')
const aula = require('./routes/aula')
const seminario = require('./routes/seminario')
const showtime = require('./routes/showtime')

mongoose.set('strictQuery', false)

mongoose
	.connect(process.env.DATABASE, { autoIndex: true })
	.then(() => {
		console.log('database connected!')
	})
	.catch((err) => console.log(err))

const app = express()

app.use(express.json())

app.use(cookieParser())
app.use(morgan('dev'))
app.use(express.urlencoded({ extended: true }))
app.use(cors({ origin: true, credentials: true }))
app.use(mongoSanitize())
app.use(helmet())
app.use(xss())

app.use('/auth', auth)
app.use('/dip', dip)

// endpoint /aula
app.use('/aula', aula)

app.use('/seminario', seminario)
app.use('/showtime', showtime)

const port = 8080

app.listen(port, () => console.log(`start server in port ${port}`))
