import { cargarDatabase } from '../data/database.js';

export const command = 'toppersonajes';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const db = cargarDatabase();

  if (!db.users) {
    await sock.sendMessage(from, { text: '❌ No hay datos de usuarios registrados.' });
    return;
  }

  // Crear un array con usuario y cantidad de personajes
  const ranking = Object.entries(db.users)
    .map(([jid, user]) => ({
      jid,
      cantidad: (user.personajes || []).length
    }))
    .filter(u => u.cantidad > 0)
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 10); // Top 10

  if (ranking.length === 0) {
    await sock.sendMessage(from, { text: '❌ Nadie tiene personajes aún.' });
    return;
  }

  const texto = ranking
    .map((u, i) => `${i + 1}. @${u.jid.split('@')[0]} → ${u.cantidad} personaje(s)`)
    .join('\n');

  await sock.sendMessage(from, {
    text: `🏆 *Top 10 usuarios con más personajes:*\n\n${texto}`,
    mentions: ranking.map(u => u.jid)
  });
}
