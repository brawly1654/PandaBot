import fs from 'fs';
const CD_FILE = './data/cooldowns.json';

export function loadCooldowns() {
  if (!fs.existsSync(CD_FILE)) {
    fs.writeFileSync(CD_FILE, JSON.stringify({}));
  }
  return JSON.parse(fs.readFileSync(CD_FILE, 'utf8'));
}

export function saveCooldowns(cooldowns) {
  fs.writeFileSync(CD_FILE, JSON.stringify(cooldowns, null, 2));
}

