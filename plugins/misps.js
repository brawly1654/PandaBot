import fs from 'fs';
import { cargarDatabase } from '../data/database.js';

const data = JSON.parse(fs.readFileSync('./data/personajes.json', 'utf8'));
const personajes = data.characters;

export const command = 'misps';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  const db = cargarDatabase();
  db.users = db.users || {};
  const user = db.users[sender];

  if (!user) {
    await sock.sendMessage(from, { text: '❌ No estás registrado. Usa .registrar para empezar.' });
    return;
  }

  user.personajes = user.personajes || [];

  if (user.personajes.length === 0) {
    await sock.sendMessage(from, { text: '📦 No tienes personajes aún. Compra uno con .buy <NombrePersonaje>.' });
    return;
  }

  const userCharacters = user.personajes
    .map(pName => personajes.find(p => p.nombre === pName))
    .filter(p => p !== undefined);

  userCharacters.sort((a, b) => b.precio - a.precio);

  let texto = `🐼 *Tus personajes comprados:* 🐼\n\n`;

  for (const p of userCharacters) {
    let efectosText = p.efectos && p.efectos.length > 0 ? ` [${p.efectos.join(', ')}]` : '';
    texto += `• *${p.nombre}* (${p.calidad})${efectosText} – 💰 ${p.precio} pandacoins\n`;
  }

  await sock.sendMessage(from, { text: texto });
}

