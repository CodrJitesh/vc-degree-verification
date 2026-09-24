# Decentralized Identity & Verifiable Credentials

University degree credential verification — Issuer → Holder → Verifier.

**Repo:** https://github.com/CodrJitesh/vc-degree-verification  
**Contract:** [TEAM_CONTRACT.md](TEAM_CONTRACT.md) (Almighty Jitesh) · [decision.md](decision.md)

## Layout

| Path | Owner | Status |
|------|--------|--------|
| [`frontend/`](frontend/) | Teammate B (+ verifier UI) | Landing, onboarding, issuer dashboard, `/verifier` |
| [`backend/`](backend/) | B + C (`utkarsh` merged) | Universities, issue, holder, verifier APIs on **:3000** |
| [`android-wallet/`](android-wallet/) | Jitesh | Student holder wallet |
| [`shared/`](shared/) | C samples | Sample VC + verification request JSON |
| [`backend/schema.json`](backend/schema.json) | C | UniversityDegreeCredential schema stub |

## Run locally

### Backend (port 3000)

```bash
cd backend && npm install && npm start
```

Health: `GET http://localhost:3000/health`  
Register: `POST http://localhost:3000/api/universities/register`

### Frontend (Vite)

```bash
cd frontend && npm install && npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

### Android wallet

Open `android-wallet/` in Android Studio. **Gradle JDK = 21** (not 25).  
See [android-wallet/README.md](android-wallet/README.md).

## What’s next after mem-b merge

1. **Teammate B** — university dashboard + issue-credential UI; verifier portal  
2. **Teammate C** — Privado Issuer Node + `CGPA >= 8` query + remaining `/api/...` stubs  
3. **Jitesh** — import issued VC into wallet; wire `PrivadoWalletBridge` when C is ready  
