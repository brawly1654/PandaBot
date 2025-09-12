export const command = 'ship';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const mentions = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];

  if (mentions.length < 2) {
    await sock.sendMessage(from, { text: '💞 Usa .ship @usuarioA @usuarioB' });
    return;
  }

  const nameA = mentions[0].split('@')[0];
  const nameB = mentions[1].split('@')[0];
  const percent = Math.floor(Math.random() * 101);
  const shipName = (nameA.slice(0,3) + nameB.slice(0,3)).toLowerCase();

  const text = `💞 *${shipName}* nació! @${nameA} ❤️ @${nameB}\nCompatibilidad: *${percent}%*`;

  await sock.sendMessage(from, { text, mentions });
}
