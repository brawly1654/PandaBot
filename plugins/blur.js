import { downloadMediaMessage } from '@whiskeysockets/baileys';
import Jimp from 'jimp';

export const command = 'blur';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const isImage = quoted?.imageMessage;

  if (!isImage) {
    await sock.sendMessage(from, { text: '❌ Cita una imagen para desenfocarla. Opcional: añade un nivel (ej: .blur 5).' }, { quoted: msg });
    return;
  }

  const level = parseInt(args[0]) || 5;
  if (level < 1 || level > 20) {
    await sock.sendMessage(from, { text: '❌ El nivel de desenfoque debe estar entre 1 y 20.' }, { quoted: msg });
    return;
  }

  try {
    const stream = await downloadMediaMessage(quoted.imageMessage, 'buffer', {}, { logger: console });
    const image = await Jimp.read(stream);

    image.blur(level);
    
    const processedBuffer = await image.getBufferAsync(Jimp.MIME_JPEG);
    await sock.sendMessage(from, { image: processedBuffer, caption: `✅ Imagen desenfocada (Nivel ${level}).` }, { quoted: msg });

  } catch (e) {
    console.error('❌ Error en el comando blur:', e);
    await sock.sendMessage(from, { text: '❌ Ocurrió un error al procesar la imagen.' }, { quoted: msg });
  }
}

