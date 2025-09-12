export const command = 'otaku';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const mentions = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];

  if (mentions.length === 0) {
    await sock.sendMessage(from, { text: '🍥 Usa .otaku @usuario' });
    return;
  }

  const percent = Math.floor(Math.random() * 101);
  const text = `🍥 @${mentions[0].split('@')[0]} es *${percent}%* otaku!`;

  await sock.sendMessage(from, { text, mentions });
}
