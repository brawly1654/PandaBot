import { cargarDatabase, guardarDatabase } from '../data/database.js';
import { isVip } from '../utils/vip.js';

export const command = 'superminar';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  
  if (!isVip(sender)) {
    await sock.sendMessage(from, { text: '❌ Este comando es solo para usuarios VIP.' });
    return;
  }

  const db = cargarDatabase();
  const user = db.users[sender];
  
  user.cooldowns = user.cooldowns || {};
  const now = Date.now();
  const cooldownTime = 2 * 60 * 60 * 1000; // 6 horas
  
  if (now - (user.cooldowns.superminar || 0) < cooldownTime) {
    const timeLeft = cooldownTime - (now - (user.cooldowns.superminar || 0));
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    await sock.sendMessage(from, { text: `⏳ Debes esperar ${hours}h ${minutes}m para volver a usar .superminar.` });
    return;
  }

  const coinsGanados = 20000; // Doble que el minado normal
  const diamantesGanados = 50; // Bonus de diamantes
  
  user.pandacoins = (user.pandacoins || 0) + coinsGanados;
  user.diamantes = (user.diamantes || 0) + diamantesGanados;
  user.cooldowns.superminar = now;
  guardarDatabase(db);
  
  await sock.sendMessage(from, { text: `⛏️ *Superminería VIP*\n\n💰 Ganaste *${coinsGanados} pandacoins*.\n💎 Ganaste *${diamantesGanados} diamantes*.` });
}

