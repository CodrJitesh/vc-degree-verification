# Android student wallet (Holder)

Owned by **Jitesh** per [TEAM_CONTRACT.md](../TEAM_CONTRACT.md) (Almighty Jitesh).

## What this app does (MVP)

1. **My Credentials** — list held degree VCs
2. **Import credential** — paste dashboard JSON, or fetch `GET /api/holder/credentials?studentDid=…`
3. **Credential detail** — show claims stored on device
4. **Verification request** — consent UX → Approve / Reject
5. **Proof** — `PrivadoWalletBridge` mock presentation; real SDK later

Deep link for requests: `vcdegree://verify/VR-18291`

### Import flow (with issuer dashboard)

1. Run backend + frontend, issue a credential, **Copy JSON**
2. On phone: **Import credential** → paste → **Import pasted JSON**
3. Or set API base URL to your laptop LAN IP (`http://192.168.x.x:3000`) and **Fetch from server**

## Open in Android Studio

1. Open the `android-wallet/` folder
2. **Gradle JDK must be 17–22** (not 25). Gradle 8.9 rejects JDK 25.
   - macOS Homebrew: `/opt/homebrew/opt/openjdk@21`
   - Android Studio → Settings → Build Tools → Gradle → **Gradle JDK → 21**
   - `gradle.properties` already sets `org.gradle.java.home` for this machine
3. Sync Gradle (AGP 8.5.2, compileSdk 35)
4. Run on emulator or device

## Utkarsh — Wallet SDK hook

See `app/src/main/java/com/vcdegree/wallet/wallet/PrivadoWalletBridge.kt` and comments in `app/build.gradle.kts`.

When ready:

1. Uncomment the Polygon ID / Privado dependency
2. Supply EnvEntity (network, RPC, state contract, push URL)
3. Set `PRIVADO_SDK_ENABLED` to `true` in `defaultConfig`
4. Replace mock `generatePresentation` with SDK `prove`
5. Point `API_BASE_URL` at the Node facade

Sample assets (match TEAM_CONTRACT schemas):

- `app/src/main/assets/sample_credential.json`
- `app/src/main/assets/sample_verification_request.json`
