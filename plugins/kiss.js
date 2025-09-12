export const command = 'kiss';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;

  // Detectar si hay mención o respuesta
  let who;
  const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

  if (mentions.length > 0) {
    who = mentions[0];
  } else if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
    who = msg.message.extendedTextMessage.contextInfo.participant;
  } else {
    who = msg.key.participant || msg.key.remoteJid;
  }

  // Conseguir nombres
  const name2 = msg.pushName || 'Alguien';
  let name = who && who !== msg.key.participant ? who : null;

  // Mensaje
  let str;
  if (mentions.length > 0) {
    str = `\`${name2}\` le dio besos a \`${name}\` ( ˘ ³˘)♥.`;
  } else if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
    str = `\`${name2}\` besó a \`${name}\` 💋.`;
  } else {
    str = `\`${name2}\` se besó a sí mismo ( ˘ ³˘)♥`;
  }

  // Lista de videos
  const videos = [
    'https://telegra.ph/file/d6ece99b5011aedd359e8.mp4',
    'https://telegra.ph/file/ba841c699e9e039deadb3.mp4',
    'https://telegra.ph/file/6497758a122357bc5bbb7.mp4',
    'https://telegra.ph/file/8c0f70ed2bfd95a125993.mp4',
    'https://telegra.ph/file/826ce3530ab20b15a496d.mp4',
    'https://telegra.ph/file/f66bcaf1effc14e077663.mp4',
    'https://telegra.ph/file/e1dbfc56e4fcdc3896f08.mp4',
    'https://telegra.ph/file/0fc525a0d735f917fd25b.mp4',
    'https://telegra.ph/file/68643ac3e0d591b0ede4f.mp4',
    'https://telegra.ph/file/af0fe6eb00bd0a8a9e3a0.mp4'
  ];
  const video = videos[Math.floor(Math.random() * videos.length)];

  try {
    await sock.sendMessage(from, {
      video: { url: video },
      gifPlayback: true,
      caption: str,
      mentions: who ? [who] : []
    }, { quoted: msg });
  } catch (e) {
    console.error('❌ Error al enviar kiss:', e);
    await sock.sendMessage(from, { text: '❌ Ocurrió un error.' });
  }
}
