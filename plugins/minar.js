import fs from 'fs';
import path from 'path';
import { cargarDatabase, guardarDatabase } from '../data/database.js';

export const command = 'minar';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  // === Cooldown ===
  const cdPath = path.resolve('./data/cooldowns.json');
  if (!fs.existsSync(cdPath)) fs.writeFileSync(cdPath, '{}');

  const cooldowns = JSON.parse(fs.readFileSync(cdPath));
  const lastTime = cooldowns[sender]?.minar || 0;
  const now = Date.now();
  const cooldownTime = 45 * 60 * 1000; // 45 minutos

  if (now - lastTime < cooldownTime) {
    const minutesLeft = Math.ceil((cooldownTime - (now - lastTime)) / 60000);
    await sock.sendMessage(from, {
      text: `🕒 *Cooldown activo*\n⛏️ Espera *${minutesLeft} minuto(s)* antes de volver a minar.`
    }, { quoted: msg });
    return;
  }

  // === Inicialización de usuario: Solución Definitiva ===
  const db = cargarDatabase();
  db.users = db.users || {};
  db.users[sender] = db.users[sender] || {
    pandacoins: 0,
    exp: 0,
    diamantes: 0,
    piedras: 0,
    carne: 0,
    pescado: 0,
    madera: 0,
    comida: 0,
    oro: 0,
    salud: 100,
    personajes: []
  };

  // === Recompensas aleatorias ===
  const coinsGanados = 2000 + Math.floor(Math.random() * 4000);
  const diamantesGanados = Math.random() < 0.3 ? 1 : 0; // 30% probabilidad
  const piedrasGanadas = Math.floor(Math.random() * 10) + 2;

  // === Asignar recompensas ===
  const user = db.users[sender];
  user.pandacoins += coinsGanados;
  user.diamantes += diamantesGanados;
  user.piedras += piedrasGanadas;

  // === Sumar al clan si pertenece a uno ===
  if (db.clanes) {
    const clanName = Object.keys(db.clanes).find(nombre =>
      db.clanes[nombre].miembros.includes(sender)
    );
    if (clanName) {
      db.clanes[clanName].recolectados = (db.clanes[clanName].recolectados || 0) + coinsGanados;
    }
  }

  // === Guardado directo y robusto ===
  fs.writeFileSync('./data/database.json', JSON.stringify(db, null, 2));
  
  // === Actualizar cooldown ===
  cooldowns[sender] = cooldowns[sender] || {};
  cooldowns[sender].minar = now;
  fs.writeFileSync(cdPath, JSON.stringify(cooldowns, null, 2));

  const footer = `\n━━━━━━━━━━━━━━━━━━━\n🔗 *Canal Oficial:*\nhttps://whatsapp.com/channel/0029Vb6SmfeAojYpZCHYVf0R\n━━━━━━━━━━━━━━━━━━━`;
  let texto = `⛏️ *Minería completada*\n\n`;
  texto += `💰 Pandacoins: +${coinsGanados}\n`;
  texto += `🪨 Piedras: +${piedrasGanadas}\n`;
  if (diamantesGanados) texto += `💎 Diamantes: +${diamantesGanados}\n`;

  await sock.sendMessage(from, { text: texto + footer }, { quoted: msg });
}

