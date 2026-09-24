const path = require('path');
const fs = require('fs');
const { auth, resolver, protocol } = require('@iden3/js-iden3-auth');
const { v4: uuidv4 } = require('uuid');

const SCHEMA_CONTEXT =
  process.env.SCHEMA_CONTEXT_URL ||
  'https://raw.githubusercontent.com/CodrJitesh/vc-degree-verification/main/schemas/university-degree.jsonld';

const SCHEMA_TYPE = process.env.SCHEMA_TYPE || 'UniversityDegreeCredential';

const CIRCUITS_PATH =
  process.env.CIRCUITS_PATH ||
  path.join(__dirname, '../../node_modules/@iden3/js-iden3-auth/circuits');

const sessions = new Map();

function privadoEnabled() {
  return String(process.env.PRIVADO_ENABLED || 'true').toLowerCase() !== 'false';
}

function circuitsReady() {
  // fullVerify needs wasm; package only ships verification_key.json until you download circuits
  const probe = path.join(CIRCUITS_PATH, 'authV2', 'circuit.wasm');
  const probe2 = path.join(CIRCUITS_PATH, 'credentialAtomicQuerySigV2', 'circuit.wasm');
  return fs.existsSync(probe) || fs.existsSync(probe2);
}

function getVerifierDid() {
  return (
    process.env.VERIFIER_DID ||
    // Placeholder audience — replace with DID from Issuer Node / identity wallet
    'did:polygonid:polygon:amoy:2qCU58EJgrEsam5wZ3r49YiGvdkxZLQsX4jPPjJfcF'
  );
}

function getCallbackBase() {
  return (process.env.PUBLIC_CALLBACK_BASE || 'http://localhost:3000').replace(/\/$/, '');
}

/**
 * Build an Iden3 Authorization Request with CGPA >= 8 as ZK query.
 * Uses cgpaX10 integer (8.0 -> 80) and $gte operator (SigV2 / V3).
 */
function buildCgpaProofRequest(threshold = 8) {
  const cgpaX10Min = Math.round(Number(threshold) * 10);
  return {
    id: 1,
    circuitId: 'credentialAtomicQuerySigV2',
    query: {
      allowedIssuers: ['*'],
      type: SCHEMA_TYPE,
      context: SCHEMA_CONTEXT,
      credentialSubject: {
        // SigV2 supports $gt; cgpaX10 > 79 ⇒ CGPA >= 8.0 when stored as tenths
        cgpaX10: {
          $gt: cgpaX10Min - 1,
        },
      },
    },
  };
}

function createPrivadoAuthRequest({
  requestId,
  verifierName,
  cgpaThreshold = 8,
} = {}) {
  const sessionId = requestId || uuidv4();
  const callbackUrl = `${getCallbackBase()}/api/privado/callback?sessionId=${encodeURIComponent(sessionId)}`;
  const reason = `${verifierName || 'Verifier'} — prove CGPA >= ${cgpaThreshold} (ZK)`;

  const authRequest = auth.createAuthorizationRequest(
    reason,
    getVerifierDid(),
    callbackUrl
  );

  authRequest.id = sessionId;
  authRequest.thid = sessionId;
  authRequest.body.scope = [buildCgpaProofRequest(cgpaThreshold)];

  sessions.set(sessionId, {
    sessionId,
    authRequest,
    status: 'pending',
    createdAt: new Date().toISOString(),
    result: null,
  });

  return {
    sessionId,
    authRequest,
    qrPayload: authRequest,
    deepLink: `iden3comm://?request_uri=${encodeURIComponent(
      `${getCallbackBase()}/api/privado/request/${sessionId}`
    )}`,
    schema: {
      type: SCHEMA_TYPE,
      context: SCHEMA_CONTEXT,
      claim: 'cgpaX10',
      thresholdX10: Math.round(Number(cgpaThreshold) * 10),
    },
    circuitsReady: circuitsReady(),
    mode: 'privado-iden3',
  };
}

function getSession(sessionId) {
  return sessions.get(sessionId) || null;
}

function getAuthRequest(sessionId) {
  return sessions.get(sessionId)?.authRequest || null;
}

/**
 * Verify JWZ token from wallet (requires circuit.wasm files in CIRCUITS_PATH).
 */
async function verifyPrivadoProof(sessionId, tokenStr) {
  const session = sessions.get(sessionId);
  if (!session) {
    const err = new Error('Unknown Privado session');
    err.status = 404;
    throw err;
  }

  if (!circuitsReady()) {
    // Soft-accept for hackathon until circuits are downloaded — still records attempt
    session.status = 'awaiting_circuits';
    session.result = {
      verified: false,
      reason:
        'Auth request is real Iden3, but circuit.wasm files are missing. Run: npm run privado:circuits',
      tokenReceived: Boolean(tokenStr),
    };
    sessions.set(sessionId, session);
    return session.result;
  }

  const ethStateResolver = new resolver.EthStateResolver(
    process.env.RPC_URL || 'https://rpc-amoy.polygon.technology/',
    process.env.STATE_CONTRACT || '0x1a4cC30f2aA0377b0c3bc9848766D90cb4404124'
  );

  const resolvers = {
    ['polygon:amoy']: ethStateResolver,
  };

  const verifier = await auth.Verifier.newVerifier({
    stateResolver: resolvers,
    circuitsDir: CIRCUITS_PATH,
    ipfsGatewayURL: process.env.IPFS_GATEWAY || 'https://ipfs.io',
  });

  const opts = {
    AcceptedStateTransitionDelay: 5 * 60 * 1000,
  };

  const verified = await verifier.fullVerify(tokenStr, session.authRequest, opts);

  session.status = 'verified';
  session.result = {
    verified: true,
    verifiedAt: new Date().toISOString(),
    from: verified?.from || null,
    message: 'Privado / Iden3 ZK proof verified (CGPA predicate)',
  };
  sessions.set(sessionId, session);
  return session.result;
}

module.exports = {
  privadoEnabled,
  circuitsReady,
  createPrivadoAuthRequest,
  getSession,
  getAuthRequest,
  verifyPrivadoProof,
  buildCgpaProofRequest,
  SCHEMA_CONTEXT,
  SCHEMA_TYPE,
};
