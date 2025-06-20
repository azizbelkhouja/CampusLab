

const express = require('express')
const {
	getAulas,
	getAula,
	getUnreleasedAula,
	getAulaBySeminario,
	createAula,
	updateAula,
	deleteAula,
	getUnreleasedAulaBySeminario
} = require('../controllers/aulaController')

const router = express.Router()

const { protect, authorize } = require('../middleware/auth')

// Progettazione delle API
router.route('/').get(getAulas).post(protect, authorize('admin'), createAula)
router.route('/unreleased/:id').get(protect, authorize('admin'), getUnreleasedAula)

router.route('/seminario/unreleased/:mid/:date/:timezone').get(protect, authorize('admin'), getUnreleasedAulaBySeminario)
router.route('/seminario/:mid/:date/:timezone').get(getAulaBySeminario)

// definisce tre rotte per l’endpoint /aula/:id
router
	.route('/:id')
	.get(getAula)
	.put(protect, authorize('admin'), updateAula)
	.delete(protect, authorize('admin'), deleteAula)

module.exports = router
