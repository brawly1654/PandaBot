export const command = 'luck';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const mentions = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];

  if (mentions.length === 0) {
    await sock.sendMessage(from, { text: '🍀 Usa .luck @usuario' });
    return;
  }

  const percent = Math.floor(Math.random() * 101);
  const text = `🍀 Hoy @${mentions[0].split('@')[0]} tiene *${percent}%* de suerte!`;

  await sock.sendMessage(from, { text, mentions });
}
