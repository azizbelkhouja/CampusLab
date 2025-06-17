const express = require('express')
const {
	getTheaters,
	getTheater,
	getUnreleasedTheater,
	getTheaterBySeminario,
	createTheater,
	updateTheater,
	deleteTheater,
	getUnreleasedTheaterBySeminario
} = require('../controllers/theaterController')
const router = express.Router()

const { protect, authorize } = require('../middleware/auth')

router.route('/').get(getTheaters).post(protect, authorize('admin'), createTheater)
router.route('/unreleased/:id').get(protect, authorize('admin'), getUnreleasedTheater)
router.route('/seminario/unreleased/:mid/:date/:timezone').get(protect, authorize('admin'), getUnreleasedTheaterBySeminario)
router.route('/seminario/:mid/:date/:timezone').get(getTheaterBySeminario)
router
	.route('/:id')
	.get(getTheater)
	.put(protect, authorize('admin'), updateTheater)
	.delete(protect, authorize('admin'), deleteTheater)

module.exports = router
