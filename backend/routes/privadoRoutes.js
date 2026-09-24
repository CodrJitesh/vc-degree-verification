const express = require('express');
const getRawBody = require('raw-body');
const {
  createPrivadoAuthRequest,
  getAuthRequest,
  getSession,
  verifyPrivadoProof,
  circuitsReady,
  privadoEnabled,
} = require('../privado/privadoAuth');

const router = express.Router();

/** Status of Privado spike */
router.get('/status', (_req, res) => {
  res.json({
    enabled: privadoEnabled(),
    circuitsReady: circuitsReady(),
    schemaType: process.env.SCHEMA_TYPE || 'UniversityDegreeCredential',
    hint: circuitsReady()
      ? 'Ready for fullVerify'
      : 'Download circuit.wasm via: npm run privado:circuits',
  });
});

/** Create Iden3 auth request (CGPA >= 8 ZK query) */
router.post('/auth-request', (req, res) => {
  try {
    if (!privadoEnabled()) {
      return res.status(503).json({ error: 'PRIVADO_ENABLED=false' });
    }
    const payload = createPrivadoAuthRequest({
      requestId: req.body?.requestId,
      verifierName: req.body?.verifierName || 'ABC Technologies',
      cgpaThreshold: req.body?.cgpaThreshold ?? 8,
    });
    res.status(201).json(payload);
  } catch (error) {
    console.error('[Privado] auth-request error', error);
    res.status(500).json({ error: error.message || 'Failed to create auth request' });
  }
});

/** Wallet / QR fetches the raw auth request */
router.get('/request/:sessionId', (req, res) => {
  const authRequest = getAuthRequest(req.params.sessionId);
  if (!authRequest) return res.status(404).json({ error: 'Session not found' });
  res.json(authRequest);
});

router.get('/session/:sessionId', (req, res) => {
  const session = getSession(req.params.sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  res.json({
    sessionId: session.sessionId,
    status: session.status,
    result: session.result,
    authRequest: session.authRequest,
  });
});

/**
 * Wallet posts JWZ proof token here (Iden3 callback).
 * Content-Type is often text/plain with raw JWZ.
 */
router.post('/callback', async (req, res) => {
  try {
    const sessionId = req.query.sessionId;
    if (!sessionId) return res.status(400).json({ error: 'sessionId required' });

    let tokenStr;
    if (typeof req.body === 'string' && req.body.length) {
      tokenStr = req.body;
    } else if (req.body?.token) {
      tokenStr = req.body.token;
    } else {
      // raw body fallback when express.json already consumed empty object
      tokenStr = '';
    }

    if (!tokenStr && req.readable) {
      const raw = await getRawBody(req);
      tokenStr = raw.toString().trim();
    }

    if (!tokenStr) {
      return res.status(400).json({ error: 'Empty proof token' });
    }

    const result = await verifyPrivadoProof(String(sessionId), tokenStr);
    res.status(200).json(result);
  } catch (error) {
    console.error('[Privado] callback error', error);
    res.status(error.status || 500).json({ error: error.message || 'Verify failed' });
  }
});

module.exports = router;
