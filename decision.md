Fair. I'll give you the document directly here.

# Decentralized Identity & Verifiable Credentials Verification Portal

### 20-Hour Hackathon — Product, Architecture, Decisions & Scope

---

## 1. Executive Summary

We will build a university-degree credential verification system based on the **Issuer → Holder → Verifier** model.

A university registers as a credential issuer and issues a cryptographically signed **W3C Verifiable Credential (VC)** to a student's wallet.

The student holds the credential in an Android wallet/client application.

Later, a hiring platform creates a **verification request** specifying exactly what it needs to know about the student. The student receives that request in their wallet and explicitly approves or rejects it.

If approved, the wallet creates a **verifiable presentation / privacy-preserving proof**. The hiring platform can verify the credential and, where applicable, verify a condition without learning the underlying private value.

Example:

> Credential contains `CGPA = 9.1`.

Employer asks:

> `Is CGPA >= 8?`

The employer receives proof that the condition is true without necessarily receiving `9.1`.

The system therefore demonstrates:

**University issues → Student holds → Employer requests → Student consents → Proof is generated → Employer verifies.**

---

# 2. Problem Statement

> **Decentralized Identity & Verifiable Credentials Verification Portal**
> Arch: React + Node.js + Ethers.js + Polygon/Local EVM.
> Issue, hold, and verify W3C DID credentials for university degrees with zero-knowledge proof checks.

The project needs to satisfy each part of that statement.

| Problem statement  | Our interpretation                                                     |
| ------------------ | ---------------------------------------------------------------------- |
| Decentralized      | Trust should not depend solely on our central database                 |
| Identity           | University and student have cryptographic identities/DIDs              |
| Verifiable         | Credentials can be independently checked cryptographically             |
| Credentials        | Degree information is represented as a signed credential               |
| Verification       | External parties can verify credentials and requirements               |
| Portal             | React-based interfaces coordinate the system                           |
| Issue              | University creates and signs degree credentials                        |
| Hold               | Student possesses the credential in a wallet                           |
| W3C                | Credential/identity concepts follow W3C VC/DID standards               |
| University degrees | Initial and only credential domain for the MVP                         |
| Zero-knowledge     | Sensitive conditions can be proven without revealing underlying values |

---

# 3. Core User Story

The complete user story is:

> A university issues a digital degree to a student. The student stores the credential in their wallet. A hiring platform later asks the student to prove specific qualifications. The student decides whether to authorize the request. The wallet creates a verifiable presentation/proof, allowing the hiring platform to establish that the student satisfies the requested requirements while minimizing the information disclosed.

### Example

The student's credential contains:

```text
Name: Jitesh Singh
Degree: B.Tech
Branch: Computer Science
Graduation Year: 2027
CGPA: 9.1
```

The hiring company asks:

```text
Degree = B.Tech CSE
AND
CGPA >= 8
```

The student approves.

The verifier gets:

```text
Degree: B.Tech CSE       ✓
Graduation: 2027        ✓
CGPA >= 8               ✓
Actual CGPA:            🔒 Hidden
Credential Signature:   ✓ Valid
Issuer:                 ✓ Valid
```

The company gets the information it actually needs rather than the student's entire academic record.

---

# 4. Actors

There are three primary actors.

## 4.1 University — Issuer

The university is responsible for:

* Registering itself.
* Establishing its decentralized identity.
* Issuing degree credentials.
* Signing credentials.
* Maintaining credential status where applicable.

The university should **control its signing identity**.

### Important architectural decision

We should **not** create one generic secret key on our server and give that key to universities.

Instead:

```text
University
    ↓
University DID
    ↓
University-controlled signing key
    ↓
Signs credentials
```

This better represents the decentralized trust model.

For the hackathon, key management can be simplified, but the ownership model should remain conceptually correct.

---

# 5. Student — Holder

The student is the **holder** of the credential.

The Android application acts as the student's wallet/client.

It should:

* Receive credentials.
* Store credentials locally.
* Display credentials.
* Receive verification requests.
* Display what the verifier is asking for.
* Ask for student consent.
* Generate/send a presentation or proof.
* Optionally display verification history.

The central backend should **not be treated as the student's permanent credential wallet**.

The student's wallet should be the primary holder of the credential.

---

# 6. Hiring Team — Verifier

The hiring team or external platform is the **verifier**.

It should be able to:

1. Create a verification request.
2. Define the information/conditions it requires.
3. Send that request to a student.
4. Receive the student's presentation/proof.
5. Verify the result.

For example:

```text
Verification Request

Required:

Degree = B.Tech
Branch = Computer Science
Graduation Year <= 2027
CGPA >= 8

Reveal:

Degree
Branch
Graduation Year

Keep private:

Exact CGPA
Student ID
Other credential fields
```

---

# 7. Important Terminology

We should use **verification request** or **presentation request**, rather than "wallet request."

The hiring platform isn't asking:

> "Give me your wallet."

It is asking:

> "Prove that you satisfy these requirements."

The student's wallet receives the request and decides whether to create a presentation.

So:

```text
Verifier
   ↓
Verification Request
   ↓
Student Wallet
   ↓
Consent
   ↓
Verifiable Presentation / Proof
   ↓
Verifier
```

---

# 8. Credential Model

The degree is represented as a **Verifiable Credential**.

Conceptually:

```json
{
  "issuer": "did:...",
  "subject": "did:...",
  "credentialType": "UniversityDegreeCredential",

  "degree": "B.Tech",
  "branch": "Computer Science",
  "graduationYear": 2027,
  "cgpa": 9.1,

  "issuanceDate": "...",
  "credentialId": "...",

  "proof": "..."
}
```

The actual representation and proof format should be chosen based on the cryptographic libraries available during implementation.

The important concept is:

> This is a cryptographically signed claim made by the university about the student.

---

# 9. Credential Schema vs Verification Policy

This distinction is important.

There are **two separate contracts/interfaces**.

## 9.1 Credential Schema

This answers:

> **What information can the university issue?**

For example:

```text
UniversityDegreeCredential

student DID
name
degree
branch
graduation year
CGPA
issuer
issue date
credential ID
```

The university connector fills these fields.

```text
University
    ↓
Credential Schema
    ↓
Fill fields
    ↓
Sign
    ↓
Credential
```

---

## 9.2 Verification Policy

This answers:

> **What does the external platform want to know?**

For example:

```text
degree = B.Tech CSE
graduationYear <= 2027
CGPA >= 8
```

The verifier can additionally specify which information it actually wants revealed.

Therefore:

```text
Credential Schema
        ≠
Verification Policy
```

The credential can contain more information than the verifier needs.

That distinction is what enables privacy-preserving verification.

---

# 10. End-to-End Flow

## Step 1 — University Registration

University enters the portal.

```text
University Portal

Register University

University Name
University Domain
...

[ Register ]
```

The system establishes:

```text
University
    ↓
DID
    ↓
Public Identity
```

The university controls its signing key.

---

## Step 2 — Issue Degree

University opens:

```text
Issue Credential
```

Inputs:

```text
Student Name
Student DID
Degree
Branch
Graduation Year
CGPA
```

University clicks:

**Issue Credential**

The system:

1. Constructs the credential.
2. Signs it using the university identity.
3. Associates it with the student.
4. Provides it to the student's wallet.

---

# 11. Student Wallet

The student receives the credential.

The Android app displays:

```text
My Credentials

┌────────────────────────────┐
│ 🎓 B.Tech Computer Science │
│                            │
│ Issuer: LPU                │
│ Year: 2027                 │
│ Status: ✓ Valid            │
│                            │
│ [ View Credential ]        │
└────────────────────────────┘
```

The credential is stored locally.

The student is now the holder.

---

# 12. Verification Request

The hiring company visits the verifier portal.

They create:

```text
Verification Request
```

For example:

```text
Degree: B.Tech
Branch: Computer Science
Graduation Year: <= 2027
CGPA: >= 8
```

They can also specify:

```text
Reveal:
- Degree
- Branch
- Graduation Year

Do not reveal:
- Exact CGPA
```

The system creates a request identifier.

Potentially:

```text
Request ID: VR-18291
```

and a QR code/deep link.

---

# 13. Student Receives Request

The Android wallet receives:

```text
ABC Technologies wants to verify:

✓ B.Tech
✓ Computer Science
✓ Graduation <= 2027
✓ CGPA >= 8

Information to reveal:

B.Tech
Computer Science
2027

Exact CGPA will remain private.

[ Reject ]       [ Approve ]
```

This is an important UX component.

The student should understand **what is being requested before consenting**.

---

# 14. Proof Generation

The wallet has:

```text
CGPA = 9.1
```

The verifier wants:

```text
CGPA >= 8
```

Instead of:

```text
Student
   ↓
Server
   ↓
CGPA = 9.1
```

we want:

```text
Student Wallet
      │
      │ CGPA = 9.1
      │
      │ Generate proof
      ▼
Proof:
CGPA >= 8
      │
      ▼
Verifier
```

The verifier learns:

```text
CGPA >= 8 ✓
```

but does not necessarily learn:

```text
CGPA = 9.1
```

This is the core privacy demonstration.

---

# 15. Verification Result

The hiring portal displays:

```text
Credential Verification

Student
Jitesh Singh

Issuer
✓ University verified

Degree
✓ B.Tech

Branch
✓ Computer Science

Graduation Year
✓ 2027

CGPA Requirement
✓ >= 8

Actual CGPA
🔒 Hidden

Credential Signature
✓ Valid

Credential Status
✓ Active

────────────────────────

          ✓ VERIFIED
```

This should be the main "money shot" of the demo.

---

# 16. Recommended Architecture

```text
                     ┌───────────────────┐
                     │    UNIVERSITY     │
                     │      PORTAL       │
                     └─────────┬─────────┘
                               │
                         Issue Credential
                               │
                               ▼
                     ┌───────────────────┐
                     │   W3C VERIFIABLE  │
                     │    CREDENTIAL     │
                     └─────────┬─────────┘
                               │
                               │
                               ▼
                     ┌───────────────────┐
                     │  STUDENT WALLET   │
                     │    ANDROID APP     │
                     └─────────┬─────────┘
                               │
                         Consent / Proof
                               │
                               ▼
                     ┌───────────────────┐
                     │    VERIFIER       │
                     │      PORTAL       │
                     └───────────────────┘

              ┌──────────────────────────────┐
              │      EVM / BLOCKCHAIN        │
              │                              │
              │ DID / registry / status     │
              └──────────────────────────────┘
```

---

# 17. Technology Responsibilities

### React

Used for:

* University portal
* Verifier portal
* Dashboard
* Credential issuance UI
* Verification request UI
* Verification results

### Node.js

Used for:

* API layer
* University registration
* Credential issuance orchestration
* Verification-request management
* Credential/status metadata
* Communication between components

### Ethers.js

Used for:

* EVM interaction
* Contract calls
* Reading registry/status
* Writing relevant blockchain transactions

### Polygon / Local EVM

For the hackathon:

**Develop against a local EVM first.**

Possible flow:

```text
Local EVM
    ↓
DID / issuer registry
    ↓
Credential status
```

If everything works and time remains:

```text
Local EVM
    ↓
Polygon testnet
```

We should **not** let blockchain deployment become a blocker.

---

# 18. Blockchain's Role

Blockchain should be treated as **infrastructure**, not as the application's database.

Potential blockchain responsibilities:

* University/public identity registry
* Credential identifier/status
* Revocation/status information
* Integrity anchoring where useful

We should **not** store:

```text
Student name
CGPA
Address
Full degree credential
Personal information
```

on a public blockchain.

The design should be:

```text
Sensitive data
     ↓
Student wallet

Trust/status information
     ↓
Blockchain
```

---

# 19. Decentralization Principle

The system should not require:

> "Trust our database because our server says this degree is valid."

Instead:

```text
University
    ↓
Signs credential
    ↓
Student holds credential
    ↓
Verifier checks signature
    ↓
Verifier independently establishes authenticity
```

Our portal coordinates the experience but shouldn't become the sole source of truth.

---

# 20. Important Architectural Correction

One initial idea was:

```text
University registers
       ↓
Our portal generates a key
       ↓
University uses our key
       ↓
Credentials are signed
```

We should **not use this as the final architecture**.

The better model is:

```text
University registers
       ↓
University gets/establishes DID
       ↓
University controls signing key
       ↓
University signs credentials
```

Reason:

If our server owns the university's signing key, the system is effectively centralized.

The university should be the entity capable of proving:

> "I issued this credential."

---

# 21. Important Privacy Correction

Another initial idea was:

```text
Student sends credential
        ↓
Our server
        ↓
Server reads CGPA
        ↓
Server performs ZK policy
        ↓
Employer
```

This should be avoided.

Instead:

```text
Credential stays with student
        ↓
Student wallet
        ↓
Generate presentation/proof
        ↓
Employer
```

The central backend shouldn't need to see the student's complete private credential merely to verify one condition.

This makes the privacy claim substantially stronger.

---

# 22. ZK / Privacy Scope

The MVP needs **one convincing privacy-preserving predicate**.

Recommended:

```text
CGPA >= threshold
```

Example:

```text
Private:
CGPA = 9.1

Public result:
CGPA >= 8 ✓
```

Once this works, the same architecture could theoretically support:

```text
graduationYear <= 2027
age >= 18
degree == B.Tech
experience >= X
```

But these should **not** all be implemented in the 20-hour MVP.

---

# 23. 20-Hour Scope

## Must Have

### University

* University registration
* DID/issuer identity
* Degree credential creation
* Cryptographic signing

### Student

* Android wallet/client
* Credential storage
* Credential display
* Verification request
* Consent
* Proof/presentation generation

### Verifier

* Create verification request
* Specify required fields/conditions
* Send request
* Verify result
* Show verification status

### Blockchain

* Local EVM integration
* Minimal registry/status contract

### Cryptography

* Real credential signature verification
* Real verification
* At least one real privacy-preserving predicate

---

# 24. Should Have

If the core flow is finished:

* QR-code verification requests
* Deep links
* Credential revocation
* Credential status
* Polygon testnet deployment
* Verification history
* Better wallet UI
* Blockchain transaction/status explorer
* Multiple predicate types

---

# 25. Explicitly Out of Scope

Do **not** attempt to build these in the 20-hour MVP:

* Generic credential marketplace
* Multiple credential domains
* Multiple blockchains
* Production-grade HSM infrastructure
* Full decentralized storage architecture
* Real university ERP/SIS integrations
* Social recovery
* Complex wallet recovery
* Full identity management platform
* Every W3C VC feature
* Large university administration system
* Multiple sophisticated ZK circuits

The objective is:

> **One extremely good end-to-end degree verification flow.**

---

# 26. Security Considerations

### Private keys

University private signing keys should never be exposed to the frontend.

For the hackathon, key management can be simplified, but production architecture would require proper secure key storage.

### Student data

Sensitive data should remain off-chain.

### Credential storage

Student credentials should preferably be stored locally in the wallet.

### Consent

Student authorization should be explicit.

### Verification

The system should separately check:

1. Credential authenticity.
2. Issuer authenticity.
3. Credential status.
4. Requested conditions.
5. Proof validity.

### Revocation

A credential being correctly signed does **not** necessarily mean it is currently valid.

For example:

```text
Signature ✓
Issuer ✓
Credential format ✓
Revoked ✗
```

Therefore, status/revocation is a separate concern.

---

# 27. Existing Ecosystem

The underlying concepts are not being invented from scratch.

Relevant existing standards and ecosystems include:

* **W3C Verifiable Credentials**
* **W3C Decentralized Identifiers**
* **Verifiable Presentations**
* **OpenID for Verifiable Presentations**
* **Polygon ID / Polygon's identity work**
* Various VC wallet and identity ecosystems

This is actually useful for the hackathon.

We don't need to claim:

> "We invented decentralized digital credentials."

Instead, our differentiation is the **specific integrated experience**:

> University degree issuance + student-controlled wallet + verifier-defined requirements + privacy-preserving verification + EVM-backed trust.

---

# 28. Why This Architecture Makes Sense

There are several reasons for the chosen separation.

### University shouldn't control the student's wallet

The university **issues** the credential.

The student **holds** it.

This creates a clean separation:

```text
Issuer ≠ Holder
```

### Verifier shouldn't receive everything

A company may need:

> "CGPA ≥ 8"

but not:

> "CGPA = 9.1"

Therefore:

```text
Requirement
    ≠
Full credential
```

### Server shouldn't see everything

If the entire credential is uploaded to our backend before every verification, we undermine the privacy argument.

Therefore:

```text
Credential
    ↓
Holder wallet
```

and preferably:

```text
Proof
    ↓
Verifier
```

### Blockchain shouldn't store personal data

Blockchain is useful for trust and status, not private academic records.

---

# 29. Demo Script

The entire hackathon demo should take roughly 2–4 minutes.

### Scene 1 — University

Register:

> LPU

Issue:

> Jitesh Singh
> B.Tech CSE
> 2027
> CGPA 9.1

Credential is signed and issued.

---

### Scene 2 — Student

Open Android wallet.

Show:

> 🎓 B.Tech Computer Science
> Issued by LPU
> ✓ Valid

---

### Scene 3 — Hiring Company

Create request:

```text
B.Tech CSE
Graduation <= 2027
CGPA >= 8
```

---

### Scene 4 — Student

Phone receives:

> ABC Technologies wants to verify your degree.

Show:

```text
They will learn:

B.Tech CSE
Graduation year

They will NOT learn:

Exact CGPA
```

Student clicks:

**Approve**

---

### Scene 5 — Verification

Hiring portal shows:

```text
Issuer ✓
Credential ✓
Degree ✓
Graduation ✓
CGPA >= 8 ✓

Exact CGPA 🔒

VERIFIED
```

Then optionally show the blockchain transaction/status underneath.

That is the complete story.

---

# 30. Success Criteria

The project is successful if we can demonstrate all of these:

* University can register.
* University has a decentralized identity.
* University can issue a degree credential.
* Credential is cryptographically signed.
* Student receives and holds the credential.
* Credential can be displayed in the wallet.
* Verifier can create a verification request.
* Student receives the request.
* Student can approve/reject it.
* Credential authenticity can be verified.
* Issuer can be verified.
* Credential status can be checked.
* At least one private condition can be verified without exposing the underlying value.
* Verifier receives only the intended information.
* Entire flow works end-to-end.

---

# 31. Open Technical Decisions Before Coding

These should be decided **before spending significant implementation time**:

### DID method

Which DID method is easiest and reliable for the hackathon?

### Credential format

Which concrete W3C-compatible VC representation should we use?

### Proof/signature mechanism

Which library gives us reliable credential signing and verification?

### ZK mechanism

This is the highest-risk component.

We need to identify a library/tool that can actually demonstrate:

```text
private CGPA = 9.1
        ↓
prove CGPA >= 8
        ↓
without revealing 9.1
```

We should test this **before** building the rest of the system around it.

### Wallet technology

Determine whether Android native/Kotlin or another client approach is fastest for the team.

### Request transport

Choose between:

* QR code
* Deep link
* Request ID
* WebSocket/polling

For the hackathon, QR/deep link is probably the cleanest user experience.

---

# 32. Final Architecture

The final conceptual architecture is:

```text
                         ┌─────────────────────┐
                         │      UNIVERSITY     │
                         │       PORTAL        │
                         └──────────┬──────────┘
                                    │
                              Issue Degree
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │  W3C VERIFIABLE     │
                         │     CREDENTIAL      │
                         │                     │
                         │ Degree              │
                         │ Branch              │
                         │ Graduation Year     │
                         │ CGPA                │
                         └──────────┬──────────┘
                                    │
                                    │ Issue
                                    ▼
                         ┌─────────────────────┐
                         │    STUDENT WALLET   │
                         │     ANDROID APP      │
                         │                     │
                         │ Holds VC            │
                         │ Controls consent    │
                         └──────────┬──────────┘
                                    │
                           Verification Request
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   STUDENT CONSENT   │
                         │                     │
                         │ Approve / Reject    │
                         └──────────┬──────────┘
                                    │
                                  Approve
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ PRESENTATION / ZK   │
                         │       PROOF         │
                         │                     │
                         │ CGPA >= 8 ✓         │
                         │ Exact CGPA hidden   │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    HIRING TEAM      │
                         │      PORTAL          │
                         │                     │
                         │ Issuer ✓            │
                         │ Credential ✓        │
                         │ Requirements ✓      │
                         │                     │
                         │     VERIFIED ✓      │
                         └─────────────────────┘


              ┌────────────────────────────────────┐
              │            EVM / POLYGON            │
              │                                    │
              │ DID / Identity                     │
              │ Registry / Status                  │
              │ Revocation / Integrity information │
              └────────────────────────────────────┘
```

## Final design principle

The system should ultimately answer this question:

> **"Can a student prove that they satisfy a hiring requirement without handing the hiring company their entire academic record?"**

The answer demonstrated by the system is:

**Yes — the university issues a cryptographically verifiable credential, the student controls it in their wallet, the verifier specifies what it needs, and the student provides a verifiable presentation/proof containing only the necessary information.**

That is the architecture I'd use as the baseline before we start breaking the 20 hours into implementation tasks.
