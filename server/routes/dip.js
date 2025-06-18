const express = require('express')
const {
	getDips,
	getDip,
	createDip,
	updateDip,
	deleteDip,
	getUnreleasedDips
} = require('../controllers/dipController')
const router = express.Router()

const { protect, authorize } = require('../middleware/auth')

router.route('/').get(getDips).post(protect, authorize('admin'), createDip)
router.route('/unreleased').get(protect, authorize('admin'), getUnreleasedDips)
router
	.route('/:id')
	.get(getDip)
	.put(protect, authorize('admin'), updateDip)
	.delete(protect, authorize('admin'), deleteDip)

module.exports = router
