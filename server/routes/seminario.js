const express = require('express')
const {
	getSeminari,
	getShowingSeminari,
	getUnreleasedShowingSeminari,
	getSeminario,
	updateSeminario,
	createSeminario,
	deleteSeminario
} = require('../controllers/seminarioController')
const router = express.Router()

const { protect, authorize } = require('../middleware/auth')

router.route('/').get(getSeminari).post(protect, authorize('admin'), createSeminario)
router.route('/showing').get(getShowingSeminari)
router.route('/unreleased/showing').get(protect, authorize('admin'), getUnreleasedShowingSeminari)
router
	.route('/:id')
	.get(getSeminario)
	.put(protect, authorize('admin'), updateSeminario)
	.delete(protect, authorize('admin'), deleteSeminario)

module.exports = router
