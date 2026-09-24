const express = require('express');
const { submitPresentation } = require('../controllers/verifierController');

const router = express.Router();

// TEAM_CONTRACT: POST /api/verify/presentations
router.post('/presentations', submitPresentation);

module.exports = router;
