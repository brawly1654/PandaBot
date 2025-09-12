import fs from 'fs';
const dbFile = './bandera_wins.json';
const cooldownFile = './bandera_cooldowns.json';

// Cargar DB
export function loadWins() {
  if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, JSON.stringify({}));
  return JSON.parse(fs.readFileSync(dbFile));
}

// Guardar DB
export function saveWins(db) {
  fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
}

// Cargar cooldowns
export function loadCooldowns() {
  if (!fs.existsSync(cooldownFile)) fs.writeFileSync(cooldownFile, JSON.stringify({}));
  return JSON.parse(fs.readFileSync(cooldownFile));
}

// Guardar cooldowns
export function saveCooldowns(db) {
  fs.writeFileSync(cooldownFile, JSON.stringify(db, null, 2));
}
