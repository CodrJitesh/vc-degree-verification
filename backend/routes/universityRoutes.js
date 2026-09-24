const express = require('express');
const { registerUniversity, getUniversities } = require('../controllers/universityController');

const router = express.Router();

// POST /api/universities/register
router.post('/register', registerUniversity);

// GET /api/universities
router.get('/', getUniversities);

module.exports = router;
