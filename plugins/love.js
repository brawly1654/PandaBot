import fs from 'fs';

export const command = 'love';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const mentions = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];

  if (mentions.length === 0) {
    await sock.sendMessage(from, { text: '❤️ Usa .love @usuario para saber el porcentaje de amor.' });
    return;
  }

  const target = mentions[0];
  const lovePercent = Math.floor(Math.random() * 101);
  const text = `💖 El amor entre *tú* y @${target.split('@')[0]} es de *${lovePercent}%* ❤️`;

  await sock.sendMessage(from, { text, mentions: [sender, target] });
}
