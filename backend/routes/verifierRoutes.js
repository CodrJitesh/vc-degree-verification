const express = require('express');
const {
  createRequest,
  getRequest,
  listRequests,
  submitPresentation,
  getResult,
} = require('../controllers/verifierController');

const router = express.Router();

// TEAM_CONTRACT paths
router.post('/requests', createRequest);
router.get('/requests', listRequests);
router.get('/requests/:id', getRequest);
router.get('/requests/:id/result', getResult);

// Utkarsh / Teammate C aliases
router.post('/request', createRequest);
router.get('/request/:id', getRequest);
router.post('/submit-proof', submitPresentation);

module.exports = router;
