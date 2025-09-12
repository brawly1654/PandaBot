import fs from 'fs';
import path from 'path';
import { cargarDatabase, guardarDatabase } from '../data/database.js';

export const command = 'cazar';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  const cdPath = path.resolve('./data/cooldowns.json');
  if (!fs.existsSync(cdPath)) fs.writeFileSync(cdPath, '{}');

  const cooldowns = JSON.parse(fs.readFileSync(cdPath));
  const lastTime = cooldowns[sender]?.cazar || 0;
  const now = Date.now();
  const cooldownTime = 0 * 60 * 1000;

  if (now - lastTime < cooldownTime) {
    const minutesLeft = Math.ceil((cooldownTime - (now - lastTime)) / 60000);
    await sock.sendMessage(from, {
      text: `🕒 *Cooldown activo*\n🏹 Espera *${minutesLeft} minuto(s)* antes de volver a cazar.`
    }, { quoted: msg });
    return;
  }

  const db = cargarDatabase();
  db.users = db.users || {};
  db.users[sender] = db.users[sender] || { 
    pandacoins: 0, exp: 0, diamantes: 0, piedras: 0, carne: 0, pescado: 0, madera: 0, comida: 0, oro: 0, personajes: [], salud: 100 
  };

  const coinsGanados = 500 + Math.floor(Math.random() * 1500);
  const expGanada = 50 + Math.floor(Math.random() * 100);
  const carneGanada = Math.floor(Math.random() * 3) + 1;

  const user = db.users[sender];
  user.pandacoins += coinsGanados;
  user.exp += expGanada;
  user.carne += carneGanada;
  
  if (db.clanes) {
    const clanName = Object.keys(db.clanes).find(nombre => db.clanes[nombre].miembros.includes(sender));
    if (clanName) {
      db.clanes[clanName].recolectados = (db.clanes[clanName].recolectados || 0) + coinsGanados;
    }
  }
  
  fs.writeFileSync('./data/database.json', JSON.stringify(db, null, 2));
  
  cooldowns[sender] = cooldowns[sender] || {};
  cooldowns[sender].cazar = now;
  fs.writeFileSync(cdPath, JSON.stringify(cooldowns, null, 2));

  const footer = `\n\n━━━━━━━━━━━━━━━━━━━\n🔗 *Canal Oficial:*\nhttps://whatsapp.com/channel/0029Vb6SmfeAojYpZCHYVf0R\n━━━━━━━━━━━━━━━━━━━`;
  let texto = `🏹 *Cacería completada*\n\n`;
  texto += `💰 Pandacoins: +${coinsGanados}\n`;
  texto += `🌟 Experiencia: +${expGanada}\n`;
  texto += `🥩 Carne: +${carneGanada}\n`;
  
  await sock.sendMessage(from, { text: texto + footer }, { quoted: msg });
}

