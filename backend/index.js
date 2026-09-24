const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Root endpoint for health check
app.get('/', (req, res) => {
    res.send({ status: 'ok', message: 'Teammate C Backend API is running' });
});

// Dummy storage for MVP
const credentials = [];
const verificationRequests = [];

// Issuer Node endpoints
app.post('/api/issuer/issue', (req, res) => {
    // In a real app, this interacts with the Privado Issuer Node
    const { studentDid, name, degree, branch, graduationYear, cgpa } = req.body;
    
    const newCredential = {
        credentialType: "UniversityDegreeCredential",
        issuer: process.env.ISSUER_DID || "did:polygonid:polygon:amoy:issuer123",
        subject: studentDid,
        claims: {
            name, degree, branch, graduationYear, cgpa
        },
        issuanceDate: new Date().toISOString(),
        credentialId: `vc-${Date.now()}`
    };
    
    credentials.push(newCredential);
    res.status(201).json({ message: "Credential issued successfully", credential: newCredential });
});

// Verifier endpoints
app.post('/api/verifier/request', (req, res) => {
    // Generates a verification request to be shown to the holder
    // Following Almighty Jitesh's contract for CGPA >= 8 privacy predicate
    const newRequest = {
        requestId: `VR-${Date.now()}`,
        verifierName: req.body.verifierName || "ABC Technologies",
        required: {
            degree: "B.Tech",
            branch: "Computer Science",
            graduationYear: { op: "<=", value: 2027 },
            cgpa: { op: ">=", value: 8 }
        },
        reveal: ["degree", "branch", "graduationYear"],
        keepPrivate: ["cgpa", "name", "studentId"]
    };
    
    verificationRequests.push(newRequest);
    res.status(201).json({ message: "Verification request created", request: newRequest });
});

app.get('/api/verifier/request/:id', (req, res) => {
    const request = verificationRequests.find(r => r.requestId === req.params.id);
    if (!request) return res.status(404).json({ error: "Request not found" });
    res.json(request);
});

// Webhook / Callback for proof submission from Android app
app.post('/api/verifier/submit-proof', (req, res) => {
    // In a real app, this verifies the ZK proof using Privado SDK
    const { requestId, proof } = req.body;
    
    console.log(`Received proof for request ${requestId}`);
    
    res.status(200).json({ 
        message: "Proof verified successfully", 
        verified: true,
        revealedData: {
            degree: "B.Tech",
            branch: "Computer Science",
            graduationYear: 2027
        }
    });
});

app.listen(PORT, () => {
    console.log(`Teammate C's Backend API running on port ${PORT}`);
});
