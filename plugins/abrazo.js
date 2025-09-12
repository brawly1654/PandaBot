export const command = 'abrazo';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const mentions = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];

  if (mentions.length === 0) {
    await sock.sendMessage(from, { text: '🤗 Usa .abrazo @usuario' });
    return;
  }

  const text = `🤗 Abraza fuerte a @${mentions[0].split('@')[0]}!`;
  await sock.sendMessage(from, { text, mentions });
}
