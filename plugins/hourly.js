import { cargarDatabase, guardarDatabase } from '../data/database.js';

export const command = 'hourly';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;  // user ID completo
  const db = cargarDatabase();

  db.users = db.users || {};

  const user = db.users[sender];
  if (!user) {
    await sock.sendMessage(from, { text: '❌ No estás registrado(no sigues al canal de PandaBot). Asegúrate de seguir al canal de PandaBot y revisar sus actualizaciones.' });
    return;
  }

  const now = Date.now();
  const cooldown = 60 * 60 * 1000; // 1 hora
  user.cooldowns = user.cooldowns || {};
  const last = user.cooldowns.hourly || 0;

  if (now - last < cooldown) {
    const restante = Math.ceil((cooldown - (now - last)) / 60000);
    await sock.sendMessage(from, { text: `⏳ Espera ${restante} minutos para volver a reclamar.` });
    return;
  }

  const coins = 50 + Math.floor(Math.random() * 200);
  const exp = 1000 + Math.floor(Math.random() * 500);

  user.pandacoins = (user.pandacoins || 0) + coins;
  user.exp = (user.exp || 0) + exp;
  user.cooldowns.hourly = now;
  guardarDatabase(db);

  await sock.sendMessage(from, { text: `🎁 ¡Recompensa por hora!\n+${coins} 🪙 Pandacoins\n+${exp} ⭐ Experiencia` });
}
