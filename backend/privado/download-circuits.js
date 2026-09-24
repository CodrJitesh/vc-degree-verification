#!/usr/bin/env node
/**
 * Download Iden3 / Privado circuit wasm + keys into ./privado/circuits
 * Needed for Verifier.fullVerify (package only ships verification_key.json).
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const OUT = path.join(__dirname, 'circuits');
const ZIP_URLS = [
  // Official bundle (may 403 in some regions)
  'https://circuits.privado.id/latest.zip',
  // Fallback mirrors occasionally used by community — update if 404
  'https://iden3-circuits-bucket.s3.eu-west-1.amazonaws.com/latest.zip',
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          file.close();
          fs.unlinkSync(dest);
          return download(res.headers.location, dest).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          res.resume();
          return;
        }
        res.pipe(file);
        file.on('finish', () => file.close(() => resolve(dest)));
      })
      .on('error', reject);
  });
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const zipPath = path.join(OUT, 'circuits.zip');
  let ok = false;
  for (const url of ZIP_URLS) {
    try {
      console.log('Downloading', url);
      await download(url, zipPath);
      ok = true;
      break;
    } catch (e) {
      console.warn('Failed:', e.message);
    }
  }
  if (!ok) {
    console.error(`
Could not download circuits automatically.

Manual steps (Almighty Jitesh Privado spike):
1. Download https://circuits.privado.id/latest.zip (or from Privado docs)
2. Unzip into backend/privado/circuits/
3. Ensure paths like:
   backend/privado/circuits/authV2/circuit.wasm
   backend/privado/circuits/credentialAtomicQuerySigV2/circuit.wasm
4. Set CIRCUITS_PATH=./privado/circuits in .env
`);
    process.exit(1);
  }

  try {
    execSync(`unzip -o "${zipPath}" -d "${OUT}"`, { stdio: 'inherit' });
  } catch {
    console.error('unzip failed — install unzip or extract circuits.zip manually into', OUT);
    process.exit(1);
  }
  console.log('Circuits ready at', OUT);
}

main();
