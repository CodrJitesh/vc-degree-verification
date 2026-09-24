const express = require('express');
const { getCredentialsForHolder } = require('../controllers/credentialController');

const router = express.Router();

// GET /api/holder/credentials?studentDid=did:polygon:...
router.get('/credentials', (req, res) => {
  req.params.studentDid = req.query.studentDid || '';
  if (!req.params.studentDid) {
    return res.status(400).json({ error: 'studentDid query param is required.' });
  }
  return getCredentialsForHolder(req, res);
});

module.exports = router;
