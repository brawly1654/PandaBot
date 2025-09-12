import fs from 'fs';

export const command = 'topparejas';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;

  const parejasFile = './data/parejas.json';
  const parejas = JSON.parse(fs.readFileSync(parejasFile, 'utf8'));

  if (parejas.length === 0) {
    await sock.sendMessage(from, { text: '😢 Aún no hay parejas registradas.' });
    return;
  }

  // Ordenar por mayor porcentaje
  const top = parejas.sort((a, b) => b.percent - a.percent).slice(0, 5);

  let text = '🏆 *Top 5 Parejas más románticas:*\n\n';
  top.forEach((p, i) => {
    text += `*${i+1}.* @${p.a.split('@')[0]} ❤️ @${p.b.split('@')[0]} → *${p.percent}%*\n`;
  });

  text += '\n💘 El amor está en el aire, ¡qué románticos! 😍';

  const mentions = top.flatMap(p => [p.a, p.b]);

  await sock.sendMessage(from, { text, mentions });
}
