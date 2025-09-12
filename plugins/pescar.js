import fs from 'fs';
import path from 'path';
import { cargarDatabase, guardarDatabase } from '../data/database.js';

export const command = 'pescar';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  const cdPath = path.resolve('./data/cooldowns.json');
  if (!fs.existsSync(cdPath)) fs.writeFileSync(cdPath, '{}');

  const cooldowns = JSON.parse(fs.readFileSync(cdPath));
  const lastTime = cooldowns[sender]?.pescar || 0;
  const now = Date.now();
  const cooldownTime = 0 * 60 * 1000; // 20 minutos

  if (now - lastTime < cooldownTime) {
    const minutesLeft = Math.ceil((cooldownTime - (now - lastTime)) / 60000);
    await sock.sendMessage(from, {
      text: `🕒 *Cooldown activo*\n🎣 Espera *${minutesLeft} minuto(s)* antes de volver a pescar.`
    }, { quoted: msg });
    return;
  }

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
    personajes: [],
    salud: 100
  };

  const coinsGanados = 300 + Math.floor(Math.random() * 1000);
  const expGanada = 30 + Math.floor(Math.random() * 80);
  const pescadoGanado = Math.floor(Math.random() * 2) + 1;

  const user = db.users[sender];
  user.pandacoins += coinsGanados;
  user.exp += expGanada;
  user.pescado += pescadoGanado;
  
  if (db.clanes) {
    const clanName = Object.keys(db.clanes).find(nombre => db.clanes[nombre].miembros.includes(sender));
    if (clanName) {
      db.clanes[clanName].recolectados = (db.clanes[clanName].recolectados || 0) + coinsGanados;
    }
  }
  
  fs.writeFileSync('./data/database.json', JSON.stringify(db, null, 2));
  
  cooldowns[sender] = cooldowns[sender] || {};
  cooldowns[sender].pescar = now;
  fs.writeFileSync(cdPath, JSON.stringify(cooldowns, null, 2));

  const footer = `\n\n━━━━━━━━━━━━━━━━━━━\n🔗 *Canal Oficial:*\nhttps://whatsapp.com/channel/0029Vb6SmfeAojYpZCHYVf0R\n━━━━━━━━━━━━━━━━━━━`;
  let texto = `🎣 *Pesca completada*\n\n`;
  texto += `💰 Pandacoins: +${coinsGanados}\n`;
  texto += `🌟 Experiencia: +${expGanada}\n`;
  texto += `🐟 Pescado: +${pescadoGanado}\n`;
  
  await sock.sendMessage(from, { text: texto + footer }, { quoted: msg });
}

