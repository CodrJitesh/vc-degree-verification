const { ethers } = require('ethers');
const crypto = require('crypto');
const { universitiesDb, credentialsDb } = require('../store');

function publicCredential(record) {
  const { signatureMessage, ...rest } = record;
  return rest;
}

/**
 * Issue a UniversityDegreeCredential signed by the university wallet.
 * Shape matches TEAM_CONTRACT.md / android-wallet sample_credential.json
 */
exports.issueCredential = async (req, res) => {
  try {
    const {
      universityId,
      studentName,
      studentDid,
      degree,
      branch,
      graduationYear,
      cgpa,
    } = req.body;

    if (
      !universityId ||
      !studentName ||
      !studentDid ||
      !degree ||
      !branch ||
      graduationYear == null ||
      cgpa == null
    ) {
      return res.status(400).json({
        error:
          'universityId, studentName, studentDid, degree, branch, graduationYear, and cgpa are required.',
      });
    }

    const uni = universitiesDb.get(universityId);
    if (!uni) {
      return res.status(404).json({ error: 'University not found. Register first.' });
    }

    const year = Number(graduationYear);
    const gpa = Number(cgpa);
    if (!Number.isFinite(year) || !Number.isFinite(gpa)) {
      return res.status(400).json({ error: 'graduationYear and cgpa must be numbers.' });
    }
    if (gpa < 0 || gpa > 10) {
      return res.status(400).json({ error: 'cgpa must be between 0 and 10.' });
    }

    const credentialId = `cred-degree-${crypto.randomUUID().slice(0, 8)}`;
    const issuanceDate = new Date().toISOString();

const claims = {
      name: studentName,
      degree,
      branch,
      graduationYear: year,
      cgpa: gpa,
      // ZK-friendly integer for Privado / Iden3 queries (9.1 -> 91)
      cgpaX10: Math.round(gpa * 10),
    };

    const unsigned = {
      credentialType: 'UniversityDegreeCredential',
      issuer: uni.did,
      subject: studentDid,
      claims,
      issuanceDate,
      credentialId,
      status: 'Valid',
    };

    const wallet = new ethers.Wallet(uni.privateKey);
    const payload = JSON.stringify(unsigned);
    const digest = ethers.id(payload);
    const proofValue = await wallet.signMessage(digest);

    const credential = {
      ...unsigned,
      proof: {
        type: 'EcdsaSecp256k1Signature2019',
        created: issuanceDate,
        verificationMethod: `${uni.did}#controller`,
        proofPurpose: 'assertionMethod',
        proofValue,
      },
      issuerName: uni.universityName,
      universityId: uni.id,
      signatureMessage: digest,
    };

    credentialsDb.set(credentialId, credential);

    console.log(
      `[Issue] ${uni.universityName} → ${studentName} | ${degree} ${branch} | CGPA ${gpa} | ${credentialId}`
    );

    res.status(201).json({
      message: 'Credential issued successfully.',
      credential: publicCredential(credential),
      // Handy for Android import / demo handoff
      androidImportJson: publicCredential(credential),
    });
  } catch (error) {
    console.error('Error issuing credential:', error);
    res.status(500).json({ error: 'Internal server error while issuing credential.' });
  }
};

exports.listCredentials = async (req, res) => {
  try {
    const { universityId, studentDid } = req.query;
    let list = Array.from(credentialsDb.values());

    if (universityId) {
      list = list.filter((c) => c.universityId === universityId);
    }
    if (studentDid) {
      list = list.filter((c) => c.subject === studentDid);
    }

    res.json({
      credentials: list.map(publicCredential),
    });
  } catch (error) {
    console.error('Error listing credentials:', error);
    res.status(500).json({ error: 'Internal server error while listing credentials.' });
  }
};

exports.getCredential = async (req, res) => {
  try {
    const cred = credentialsDb.get(req.params.credentialId);
    if (!cred) {
      return res.status(404).json({ error: 'Credential not found.' });
    }
    res.json({ credential: publicCredential(cred) });
  } catch (error) {
    console.error('Error fetching credential:', error);
    res.status(500).json({ error: 'Internal server error while fetching credential.' });
  }
};

/** Holder fetch by student DID — Android can poll this later */
exports.getCredentialsForHolder = async (req, res) => {
  try {
    const studentDid = req.params.studentDid || req.query.studentDid;
    if (!studentDid) {
      return res.status(400).json({ error: 'studentDid is required.' });
    }
    const list = Array.from(credentialsDb.values())
      .filter((c) => c.subject === studentDid)
      .map(publicCredential);

    res.json({ credentials: list });
  } catch (error) {
    console.error('Error fetching holder credentials:', error);
    res.status(500).json({ error: 'Internal server error while fetching holder credentials.' });
  }
};
