const { ethers } = require('ethers');
const crypto = require('crypto');

// In-memory store for Hackathon MVP
// In a real production system, this would be PostgreSQL or MongoDB.
const universitiesDb = new Map();

/**
 * Registers a new university and provisions a DID & Wallet
 */
exports.registerUniversity = async (req, res) => {
  try {
    const { universityName, domain, email, adminName } = req.body;

    if (!universityName || !domain || !email || !adminName) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Generate a new random Ethereum wallet for the University.
    // This represents the University's signing key.
    const wallet = ethers.Wallet.createRandom();
    
    // Construct a did:polygon (as specified in the architecture document)
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
      // NOTE: In a real architecture, the backend NEVER stores the private key natively like this.
      // The university holds it. For this hackathon demo/MVP, we store it server-side to simulate issuance 
      // without needing a complex key management UI.
      privateKey: wallet.privateKey, 
      registeredAt: new Date().toISOString()
    };

    // Store in our MVP database
    universitiesDb.set(universityId, universityRecord);

    console.log(`[Identity] Registered University: ${universityName} | DID: ${did}`);

    // Return the record to the frontend (excluding private key in a real app, 
    // but useful for hackathon debugging if the frontend needs it to issue credentials).
    res.status(201).json({
      message: 'University registered successfully.',
      university: {
        id: universityRecord.id,
        universityName: universityRecord.universityName,
        did: universityRecord.did,
        address: universityRecord.address,
      }
    });

  } catch (error) {
    console.error('Error registering university:', error);
    res.status(500).json({ error: 'Internal server error while registering university.' });
  }
};

/**
 * Returns all registered universities (useful for the verifier portal lookup)
 */
exports.getUniversities = async (req, res) => {
  try {
    const universities = Array.from(universitiesDb.values()).map(u => ({
      id: u.id,
      universityName: u.universityName,
      domain: u.domain,
      did: u.did,
      registeredAt: u.registeredAt
    }));
    
    res.json({ universities });
  } catch (error) {
    console.error('Error fetching universities:', error);
    res.status(500).json({ error: 'Internal server error while fetching universities.' });
  }
};
