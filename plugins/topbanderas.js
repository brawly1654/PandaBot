import { loadWins } from '../utils/banderas_db.js';

export const command = 'ranking';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const wins = loadWins();

  const top = Object.entries(wins)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  if (top.length === 0) {
    await sock.sendMessage(from, { text: '📊 No hay victorias registradas aún.' }, { quoted: msg });
    return;
  }

  let texto = '🏆 *Top jugadores con más victorias adivinando banderas:*\n\n';
  const mentions = [];

  for (let i = 0; i < top.length; i++) {
    const [userId, count] = top[i];
    const mentionId = userId.includes('@') ? userId : `${userId}@s.whatsapp.net`; // asegurar formato
    mentions.push(mentionId);
    texto += `*${i + 1}.* @${mentionId.split('@')[0]} → ${count} victoria(s)\n`;
  }

  await sock.sendMessage(from, { text: texto.trim(), mentions }, { quoted: msg });
}
