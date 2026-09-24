# Utkarsh (Teammate C) - Privado Issuer Node & ZK Backend

Almighty Jitesh has already done the core spine: Android wallet, unified Node APIs, verifier portal, team contract, and Privado/Iden3 auth-request spike.
I am only finishing my assigned remaining slice.

## Remaining Privado Steps

Since the Issuer Node requires Docker and significant disk space, here are the steps to spin it up and run the full Privado ZK flow locally:

### 1. Run the Privado Issuer Node (Docker)
You will need to clone the official Privado Issuer Node repository and run it locally via Docker Compose.
```bash
git clone https://github.com/0xPolygonID/issuer-node
cd issuer-node
make run
```
Once it's running, note the `ISSUER_DID` and `ISSUER_PRIVATE_KEY` and update your `backend/.env` file.

### 2. Import the Credential Schema
Use the Issuer Node UI (usually http://localhost:8080) to import the schema for `UniversityDegreeCredential`.
The schema is available at `schemas/university-degree.json` or `schemas/university-degree.jsonld`.
Once imported, copy the `SCHEMA_ID` from the UI and paste it into your `backend/.env`.

### 3. Download ZK Circuits for fullVerify
Almighty Jitesh has already provided the script. Run:
```bash
npm run privado:circuits
```
This downloads the `circuit.wasm` files needed for `fullVerify` to run when a ZK proof is submitted.

### 4. Issue Real Iden3 Credentials
The current API at `POST /api/issuer/issue` creates a simple Ethers.js signed credential.
To issue real Iden3 credentials, you should interact with the Issuer Node's API (e.g., `POST http://localhost:3001/v1/identities/:identifier/claims`) from within `credentialController.js`.

### 5. Wire the `.env` Configuration
Ensure your `backend/.env` is fully populated:
- `VERIFIER_DID`: Generate one using identity tools or use the Issuer's.
- `RPC_URL`: `https://rpc-amoy.polygon.technology/`
- `SCHEMA_ID`: The ID from Step 2.

### 6. Quickest Demo: QR -> Privado Wallet App
For the fastest ZK demo without waiting for the custom Android Wallet:
1. Generate an auth request by calling `POST /api/privado/auth-request` (with `cgpaThreshold`).
2. Generate a QR code for the `authRequest` JSON returned by the endpoint (or just the URL pointing to `/api/privado/request/:sessionId`).
3. Scan the QR code using the official **Privado Wallet app**.
4. The Privado app will generate the ZK proof and post the `JWZ` token to our callback endpoint: `/api/privado/callback`.
5. The callback will execute `verifyPrivadoProof` using the downloaded circuits and verify the student has a CGPA >= 8!
