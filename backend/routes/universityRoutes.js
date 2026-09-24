const express = require('express');
const {
  registerUniversity,
  getUniversities,
  getUniversity,
} = require('../controllers/universityController');

const router = express.Router();

router.post('/register', registerUniversity);
router.get('/', getUniversities);
router.get('/:id', getUniversity);

module.exports = router;
