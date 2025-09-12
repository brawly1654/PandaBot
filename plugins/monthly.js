import { cargarDatabase, guardarDatabase } from '../data/database.js';

export const command = 'monthly';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const db = cargarDatabase();

  db.users = db.users || {};

  const user = db.users[sender];
  if (!user) {
    await sock.sendMessage(from, { text: '❌ No estás registrado(no sigues al canal de PandaBot). Asegúrate de seguir al canal de PandaBot y revisar sus actualizaciones.' });
    return;
  }

  const now = Date.now();
  const cooldown = 30 * 24 * 60 * 60 * 1000;
  user.cooldowns = user.cooldowns || {};
  const last = user.cooldowns.monthly || 0;

  if (now - last < cooldown) {
    const restante = Math.ceil((cooldown - (now - last)) / (1000 * 60 * 60 * 24));
    await sock.sendMessage(from, { text: `⏳ Espera ${restante} días para volver a reclamar.` });
    return;
  }

  const coins = 10000 + Math.floor(Math.random() * 6000);
  const exp = 60000 + Math.floor(Math.random() * 20000);

  user.pandacoins = (user.pandacoins || 0) + coins;
  user.exp = (user.exp || 0) + exp;
  user.cooldowns.monthly = now;
  guardarDatabase(db);

  await sock.sendMessage(from, { text: `📅 ¡Recompensa mensual!\n+${coins} 🪙 Pandacoins\n+${exp} ⭐ Experiencia` });
}
