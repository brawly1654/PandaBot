// data/database.js
import fs from 'fs';

const dbFile = './database.json';

export function cargarDatabase() {
  if (!fs.existsSync(dbFile)) {
    fs.writeFileSync(dbFile, JSON.stringify({ users: {} }, null, 2));
  }
  const data = JSON.parse(fs.readFileSync(dbFile));
  return data;
}

export function guardarDatabase(data) {
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
}

export function guardarPersonajes(personajes) {
  fs.writeFileSync('./data/personajes.json', JSON.stringify({ characters: personajes }, null, 2));
}

