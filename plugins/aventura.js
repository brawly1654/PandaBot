import fs from 'fs';
import path from 'path';
import { cargarDatabase, guardarDatabase } from '../data/database.js';

export const command = 'aventura';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  const cdPath = path.resolve('./data/cooldowns.json');
  if (!fs.existsSync(cdPath)) fs.writeFileSync(cdPath, '{}');

  const cooldowns = JSON.parse(fs.readFileSync(cdPath));
  const lastTime = cooldowns[sender]?.aventura || 0;
  const now = Date.now();
  const cooldownTime = 120 * 60 * 1000; // 2 horas

  if (now - lastTime < cooldownTime) {
    const hoursLeft = Math.ceil((cooldownTime - (now - lastTime)) / 3600000);
    await sock.sendMessage(from, {
      text: `🕒 *Cooldown activo*\n🗺️ Espera *${hoursLeft} hora(s)* antes de ir de aventura.`
    }, { quoted: msg });
    return;
  }

  const db = cargarDatabase();
  db.users = db.users || {};
  db.users[sender] = db.users[sender] || { pandacoins: 0, exp: 0, diamantes: 0, piedras: 0, carne: 0, pescado: 0, oro: 0 };

  const coinsGanados = 5000 + Math.floor(Math.random() * 10000);
  const expGanada = 200 + Math.floor(Math.random() * 300);
  const oroGanado = Math.random() < 0.2 ? 1 : 0; // 20% probabilidad
  const diamantesGanados = Math.random() < 0.1 ? 1 : 0; // 10% probabilidad

  const user = db.users[sender];
  user.pandacoins += coinsGanados;
  user.exp += expGanada;
  user.oro += oroGanado;
  user.diamantes += diamantesGanados;
  
  if (db.clanes) {
    const clanName = Object.keys(db.clanes).find(nombre => db.clanes[nombre].miembros.includes(sender));
    if (clanName) {
      db.clanes[clanName].recolectados = (db.clanes[clanName].recolectados || 0) + coinsGanados;
    }
  }
  
  guardarDatabase(db);
  
  cooldowns[sender] = cooldowns[sender] || {};
  cooldowns[sender].aventura = now;
  fs.writeFileSync(cdPath, JSON.stringify(cooldowns, null, 2));

  const footer = `\n\n━━━━━━━━━━━━━━━━━━━\n🔗 *Canal Oficial:*\nhttps://whatsapp.com/channel/0029Vb6SmfeAojYpZCHYVf0R\n━━━━━━━━━━━━━━━━━━━`;
  let texto = `🗺️ *Aventura completada*\n\n`;
  texto += `💰 Pandacoins: +${coinsGanados}\n`;
  texto += `🌟 Experiencia: +${expGanada}\n`;
  if (oroGanado) texto += `🪙 Oro: +${oroGanado}\n`;
  if (diamantesGanados) texto += `💎 Diamantes: +${diamantesGanados}\n`;
  
  await sock.sendMessage(from, { text: texto + footer }, { quoted: msg });
}

