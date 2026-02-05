const fs = require('fs');

// Kita ambil data dari Environment Variable Vercel
const firebaseConfig = process.env.FIREBASE_JSON; 
const passwordsConfig = process.env.PASSWORDS_JSON;

if (!firebaseConfig || !passwordsConfig) {
    console.error("ERROR: Environment Variables belum disetting di Vercel!");
    process.exit(1);
}

// Kita susun isi file secrets.js
const content = `const SECRETS = {
    firebase: ${firebaseConfig},
    passwords: ${passwordsConfig}
};`;

// Tulis file secrets.js
fs.writeFileSync('secrets.js', content);
console.log("SUCCESS: secrets.js berhasil dibuat otomatis!");