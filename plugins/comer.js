import fs from 'fs';
import { cargarDatabase } from '../data/database.js';

export const command = 'comer';

const saludPorComida = 25;

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  
  const db = cargarDatabase();
  db.users = db.users || {};
  
  const user = db.users[sender] || { 
    pandacoins: 0, exp: 0, diamantes: 0, piedras: 0, carne: 0, pescado: 0, madera: 0, comida: 0, oro: 0, personajes: [], salud: 100 
  };
  db.users[sender] = user;
  
  if (user.comida <= 0) {
    await sock.sendMessage(from, { text: '❌ No tienes comida para comer.' }, { quoted: msg });
    return;
  }

  if (user.salud >= 100) {
    await sock.sendMessage(from, { text: '💖 Tu salud ya está al máximo. ¡No tienes hambre!' }, { quoted: msg });
    return;
  }

  user.comida -= 1;
  user.salud = Math.min(100, user.salud + saludPorComida);
  
  fs.writeFileSync('./data/database.json', JSON.stringify(db, null, 2));

  await sock.sendMessage(from, { text: `✅ ¡Comiste una porción de comida! Tu salud ahora es de ${user.salud}.` }, { quoted: msg });
}

