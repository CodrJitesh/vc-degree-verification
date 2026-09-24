# Privado ID / Iden3 ZK spike

As decided by **Almighty Jitesh**: real privacy path uses Privado/Iden3 — not custom Circom.

## What we built in this spike

1. **JSON-LD schema** — [`schemas/university-degree.jsonld`](../schemas/university-degree.jsonld)  
   - Claim `cgpaX10` (integer tenths) so ZK can do `cgpaX10 > 79` ⇒ CGPA ≥ 8 without revealing 9.1
2. **Node verifier** — `@iden3/js-iden3-auth`  
   - `POST /api/privado/auth-request` — real Iden3 AuthorizationRequest  
   - `GET /api/privado/request/:sessionId` — QR / wallet fetch  
   - `POST /api/privado/callback` — JWZ proof callback  
   - `GET /api/privado/status` — circuits ready?
3. **Unified verifier** — `POST /api/verifier/requests` now also attaches `request.privado.authRequest`

## Blockers on this machine (honest)

| Blocker | Impact |
|---------|--------|
| Docker daemon not running | Cannot start Issuer Node locally yet |
| Disk ~6GB free | Issuer Node images are large — free space first |
| `circuit.wasm` not in npm package | Run `npm run privado:circuits` or manual download |

## Run

```bash
cd backend
cp .env.example .env   # set RPC_URL, VERIFIER_DID when you have them
npm install
npm run privado:circuits   # when download works
npm start
curl http://localhost:3000/api/privado/status
curl -X POST http://localhost:3000/api/privado/auth-request \
  -H 'Content-Type: application/json' \
  -d '{"verifierName":"ABC Technologies","cgpaThreshold":8}'
```

## Next (still part of spike #2)

1. Free disk + start Docker → run [Privado Issuer Node](https://github.com/PrivadoID/issuer-node)
2. Import `schemas/university-degree.json` into Issuer Node / Schema Explorer
3. Issue **Iden3** credential (not only our ethers-signed JSON)
4. Prove with **Privado Wallet app** (QR of `authRequest`) — fastest real ZK demo  
   or wire Android Wallet SDK prove()
5. Callback → `fullVerify` once wasm circuits are present

## Demo story for judges (until Issuer Node is up)

> “We generate a **real Iden3 AuthorizationRequest** with a ZK query on `cgpaX10`.  
> Mock path still works for UX; Privado path activates when Issuer Node + wallet + circuits are online.”
