const { verificationRequestsDb } = require('../store');

function buildDefaultPolicy(overrides = {}) {
  return {
    verifierName: overrides.verifierName || 'ABC Technologies',
    required: overrides.required || {
      degree: 'B.Tech',
      branch: 'Computer Science',
      graduationYear: { op: '<=', value: 2027 },
      cgpa: { op: '>=', value: 8 },
    },
    reveal: overrides.reveal || ['degree', 'branch', 'graduationYear'],
    keepPrivate: overrides.keepPrivate || ['cgpa', 'name', 'studentId'],
  };
}

/**
 * Create verification request (TEAM_CONTRACT + Utkarsh / Teammate C).
 * Privacy predicate locked by Almighty Jitesh: CGPA >= 8.
 */
exports.createRequest = async (req, res) => {
  try {
    const policy = buildDefaultPolicy(req.body || {});
    const requestId =
      req.body?.requestId || `VR-${Date.now().toString().slice(-6)}`;

    const record = {
      requestId,
      ...policy,
      status: 'pending',
      deepLink: `vcdegree://verify/${requestId}`,
      createdAt: new Date().toISOString(),
      result: null,
    };

    verificationRequestsDb.set(requestId, record);

    console.log(`[Verifier] Created ${requestId} for ${record.verifierName}`);

    res.status(201).json({
      message: 'Verification request created',
      request: record,
    });
  } catch (error) {
    console.error('Error creating verification request:', error);
    res.status(500).json({ error: 'Failed to create verification request.' });
  }
};

exports.getRequest = async (req, res) => {
  try {
    const id = req.params.id || req.params.requestId;
    const request = verificationRequestsDb.get(id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json(request);
  } catch (error) {
    console.error('Error fetching verification request:', error);
    res.status(500).json({ error: 'Failed to fetch verification request.' });
  }
};

exports.listRequests = async (_req, res) => {
  try {
    res.json({
      requests: Array.from(verificationRequestsDb.values()),
    });
  } catch (error) {
    console.error('Error listing verification requests:', error);
    res.status(500).json({ error: 'Failed to list verification requests.' });
  }
};

/**
 * Accept presentation / (mock) ZK proof from Android wallet.
 */
exports.submitPresentation = async (req, res) => {
  try {
    const { requestId, proof, presentation, revealed } = req.body || {};
    if (!requestId) {
      return res.status(400).json({ error: 'requestId is required.' });
    }

    let request = verificationRequestsDb.get(requestId);
    if (!request) {
      // Allow late/orphan submit for demo — create shell request
      request = {
        requestId,
        ...buildDefaultPolicy(),
        status: 'pending',
        deepLink: `vcdegree://verify/${requestId}`,
        createdAt: new Date().toISOString(),
        result: null,
      };
      verificationRequestsDb.set(requestId, request);
    }

    let revealedData = revealed;
    if (!revealedData && typeof presentation === 'string') {
      try {
        const parsed = JSON.parse(presentation);
        revealedData = parsed.revealed || null;
      } catch {
        revealedData = null;
      }
    }
    if (!revealedData && proof && typeof proof === 'object') {
      revealedData = proof.revealed || null;
    }

    const result = {
      verified: true,
      verifiedAt: new Date().toISOString(),
      message: 'Proof verified successfully (MVP — Privado ZK verify hooks later)',
      revealedData: revealedData || {
        degree: request.required?.degree || 'B.Tech',
        branch: request.required?.branch || 'Computer Science',
        graduationYear: 2027,
      },
      predicates: {
        cgpa: { op: '>=', value: request.required?.cgpa?.value ?? 8, satisfied: true },
      },
      proofReceived: Boolean(proof || presentation),
    };

    request.status = 'verified';
    request.result = result;
    verificationRequestsDb.set(requestId, request);

    console.log(`[Verifier] Proof accepted for ${requestId}`);

    res.status(200).json({
      message: result.message,
      verified: true,
      requestId,
      revealedData: result.revealedData,
      result,
    });
  } catch (error) {
    console.error('Error submitting presentation:', error);
    res.status(500).json({ error: 'Failed to verify presentation.' });
  }
};

exports.getResult = async (req, res) => {
  try {
    const id = req.params.id || req.params.requestId;
    const request = verificationRequestsDb.get(id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json({
      requestId: request.requestId,
      status: request.status,
      result: request.result,
      request: {
        verifierName: request.verifierName,
        required: request.required,
        reveal: request.reveal,
        keepPrivate: request.keepPrivate,
      },
    });
  } catch (error) {
    console.error('Error fetching verification result:', error);
    res.status(500).json({ error: 'Failed to fetch verification result.' });
  }
};
