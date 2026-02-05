const fs = require('fs');
const path = require('path');

const firebaseConfig = process.env.FIREBASE_JSON;
const passwordsConfig = process.env.PASSWORDS_JSON;

if (!firebaseConfig || !passwordsConfig) {
  console.error("ERROR: Env Variables FIREBASE_JSON atau PASSWORDS_JSON belum diset!");
  process.exit(1);
}

const content = `
const SECRETS = {
  firebase: ${firebaseConfig},
  passwords: ${passwordsConfig}
};

const firebaseConfig = SECRETS.firebase;
const PASSWORDS = SECRETS.passwords;
`;

const publicDir = path.join(__dirname, 'public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

fs.writeFileSync(
  path.join(publicDir, 'secrets.js'),
  content.trim()
);

console.log("SUCCESS: public/secrets.js berhasil dibuat");