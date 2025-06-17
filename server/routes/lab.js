const express = require('express')
const {
	getLabs,
	getLab,
	createLab,
	updateLab,
	deleteLab,
	getUnreleasedLabs
} = require('../controllers/labController')
const router = express.Router()

const { protect, authorize } = require('../middleware/auth')

router.route('/').get(getLabs).post(protect, authorize('admin'), createLab)
router.route('/unreleased').get(protect, authorize('admin'), getUnreleasedLabs)
router
	.route('/:id')
	.get(getLab)
	.put(protect, authorize('admin'), updateLab)
	.delete(protect, authorize('admin'), deleteLab)

module.exports = router
