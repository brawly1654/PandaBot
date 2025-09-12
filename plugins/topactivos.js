import fs from 'fs';

export const command = 'topactivos';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const messagesFile = './data/messages.json';
  const messagesCount = JSON.parse(fs.readFileSync(messagesFile, 'utf8'));

  const lista = Object.entries(messagesCount).map(([id, count]) => ({ id, count }));
  const top = lista.sort((a, b) => b.count - a.count).slice(0, 5);

  if (top.length === 0) {
    await sock.sendMessage(from, { text: '📊 No hay datos aún de usuarios activos.' });
    return;
  }

  let text = '🏆 *Top 5 usuarios más activos:* \n\n';
  top.forEach((u, i) => {
    text += `*${i+1}.* @${u.id.split('@')[0]} → *${u.count}* mensajes\n`;
  });

  const mentions = top.map(u => u.id);

  await sock.sendMessage(from, { text, mentions });
}
