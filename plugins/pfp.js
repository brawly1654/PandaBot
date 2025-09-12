export const command = 'pfp';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;

  let target;

  const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

  if (mentions.length > 0) {
    target = mentions[0];
  } else if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
    target = msg.message.extendedTextMessage.contextInfo.participant;
  } else {
    target = msg.key.participant || msg.key.remoteJid;
  }

  try {
    // Pedimos la foto de perfil
    const pfpUrl = await sock.profilePictureUrl(target, 'image');

    if (pfpUrl) {
      await sock.sendMessage(from, { image: { url: pfpUrl }, caption: `✨ Foto de perfil de @${target.split('@')[0]}`, mentions: [target] }, { quoted: msg });
    } else {
      await sock.sendMessage(from, { text: '⚠️ Este usuario no tiene foto de perfil.' }, { quoted: msg });
    }
  } catch (e) {
    console.error('❌ Error al obtener pfp:', e);
    await sock.sendMessage(from, { text: '❌ Ocurrió un error al obtener la foto de perfil.' }, { quoted: msg });
  }
}
