const fs = require('fs');
const path = require('path');

const firebaseConfig = process.env.FIREBASE_JSON; 
const passwordsConfig = process.env.PASSWORDS_JSON;

if (!firebaseConfig || !passwordsConfig) {
    console.error("ERROR: Env Variables belum setting!");
    process.exit(1);
}

const content = `const SECRETS = {
    firebase: ${firebaseConfig},
    passwords: ${passwordsConfig}
};`;

if (!fs.existsSync('./public')){
    fs.mkdirSync('./public');
}

fs.writeFileSync('./public/secrets.js', content);

console.log("SUCCESS: secrets.js berhasil dibuat di dalam folder public!");