import { cargarDatabase } from '../data/database.js';

export const command = 'topahorcados';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const db = cargarDatabase();
  db.juegos = db.juegos || {};
  db.juegos.ahorcado = db.juegos.ahorcado || {};
  db.juegos.ahorcado.victorias = db.juegos.ahorcado.victorias || {};

  const victorias = db.juegos.ahorcado.victorias;
  const jugadores = Object.entries(victorias)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  if (jugadores.length === 0) {
    await sock.sendMessage(from, { text: '📊 No hay victorias registradas en el Ahorcado aún.' });
    return;
  }

  let ranking = '🏆 *Top 5 Jugadores del Ahorcado*\n\n';
  const mentions = [];

  for (let i = 0; i < jugadores.length; i++) {
    const [jid, count] = jugadores[i];
    const userNumber = jid.split('@')[0];
    ranking += `${i + 1}. @${userNumber}: ${count} victoria(s)\n`;
    mentions.push(jid);
  }

  await sock.sendMessage(from, { text: ranking, mentions: mentions });
}

