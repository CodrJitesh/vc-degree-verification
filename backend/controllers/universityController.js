const { ethers } = require('ethers');
const crypto = require('crypto');
const { universitiesDb } = require('../store');

/**
 * Registers a new university and provisions a DID & Wallet
 */
exports.registerUniversity = async (req, res) => {
  try {
    const { universityName, domain, email, adminName } = req.body;

    if (!universityName || !domain || !email || !adminName) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const wallet = ethers.Wallet.createRandom();
    const did = `did:polygon:${wallet.address}`;
    const universityId = crypto.randomUUID();

    const universityRecord = {
      id: universityId,
      universityName,
      domain,
      email,
      adminName,
      did,
      address: wallet.address,
      // Hackathon MVP only — university should own this key in production.
      privateKey: wallet.privateKey,
      registeredAt: new Date().toISOString(),
    };

    universitiesDb.set(universityId, universityRecord);

    console.log(`[Identity] Registered University: ${universityName} | DID: ${did}`);

    res.status(201).json({
      message: 'University registered successfully.',
      university: {
        id: universityRecord.id,
        universityName: universityRecord.universityName,
        domain: universityRecord.domain,
        did: universityRecord.did,
        address: universityRecord.address,
      },
    });
  } catch (error) {
    console.error('Error registering university:', error);
    res.status(500).json({ error: 'Internal server error while registering university.' });
  }
};

exports.getUniversities = async (_req, res) => {
  try {
    const universities = Array.from(universitiesDb.values()).map((u) => ({
      id: u.id,
      universityName: u.universityName,
      domain: u.domain,
      did: u.did,
      registeredAt: u.registeredAt,
    }));

    res.json({ universities });
  } catch (error) {
    console.error('Error fetching universities:', error);
    res.status(500).json({ error: 'Internal server error while fetching universities.' });
  }
};

exports.getUniversity = async (req, res) => {
  try {
    const uni = universitiesDb.get(req.params.id);
    if (!uni) {
      return res.status(404).json({ error: 'University not found.' });
    }

    res.json({
      university: {
        id: uni.id,
        universityName: uni.universityName,
        domain: uni.domain,
        email: uni.email,
        adminName: uni.adminName,
        did: uni.did,
        address: uni.address,
        registeredAt: uni.registeredAt,
      },
    });
  } catch (error) {
    console.error('Error fetching university:', error);
    res.status(500).json({ error: 'Internal server error while fetching university.' });
  }
};
