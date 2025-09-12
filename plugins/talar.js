import fs from 'fs';
import path from 'path';
import { cargarDatabase, guardarDatabase } from '../data/database.js';

export const command = 'talar';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const userId = sender.split('@')[0];

  const cdPath = path.resolve('./data/cooldowns.json');
  if (!fs.existsSync(cdPath)) fs.writeFileSync(cdPath, '{}');

  const cooldowns = JSON.parse(fs.readFileSync(cdPath));
  const lastTime = cooldowns[sender]?.talar || 0;
  const now = Date.now();
  const cooldownTime = 0 * 60 * 1000;

  if (now - lastTime < cooldownTime) {
    const minutesLeft = Math.ceil((cooldownTime - (now - lastTime)) / 60000);
    await sock.sendMessage(from, {
      text: `🕒 *Cooldown activo*\n🪵 Espera *${minutesLeft} minuto(s)* antes de volver a talar.`
    }, { quoted: msg });
    return;
  }

  const db = cargarDatabase();
  db.users = db.users || {};
  db.users[sender] = db.users[sender] || { 
    pandacoins: 0, exp: 0, diamantes: 0, piedras: 0, carne: 0, pescado: 0, madera: 0, comida: 0, oro: 0, personajes: [], salud: 100 
  };

  const maderaGanada = Math.floor(Math.random() * 10) + 1;
  const user = db.users[sender];
  user.madera += maderaGanada;
  
  fs.writeFileSync('./data/database.json', JSON.stringify(db, null, 2));

  cooldowns[sender] = cooldowns[sender] || {};
  cooldowns[sender].talar = now;
  fs.writeFileSync(cdPath, JSON.stringify(cooldowns, null, 2));

  let texto = `🪵 *Tala completada*\n\n`;
  texto += `🪵 Madera: +${maderaGanada}\n`;
  
  await sock.sendMessage(from, { text: texto }, { quoted: msg });
}

