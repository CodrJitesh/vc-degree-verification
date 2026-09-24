const express = require('express');
const {
  issueCredential,
  listCredentials,
  getCredential,
} = require('../controllers/credentialController');

const router = express.Router();

router.post('/credentials', issueCredential);
router.get('/credentials', listCredentials);
router.get('/credentials/:credentialId', getCredential);

module.exports = router;
