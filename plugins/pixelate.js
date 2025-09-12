import { downloadMediaMessage } from '@whiskeysockets/baileys';
import Jimp from 'jimp';

export const command = 'pixelate';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const isImage = quoted?.imageMessage;

  if (!isImage) {
    await sock.sendMessage(from, { text: '❌ Cita una imagen para pixelarla. Opcional: añade un nivel (ej: .pixelate 10).' }, { quoted: msg });
    return;
  }

  const level = parseInt(args[0]) || 10;
  if (level < 1 || level > 50) {
    await sock.sendMessage(from, { text: '❌ El nivel de pixelado debe estar entre 1 y 50.' }, { quoted: msg });
    return;
  }

  try {
    const stream = await downloadMediaMessage(quoted.imageMessage, 'buffer', {}, { logger: console });
    const image = await Jimp.read(stream);

    image.pixelate(level);
    
    const processedBuffer = await image.getBufferAsync(Jimp.MIME_JPEG);
    await sock.sendMessage(from, { image: processedBuffer, caption: `✅ Imagen pixelada (Nivel ${level}).` }, { quoted: msg });

  } catch (e) {
    console.error('❌ Error en el comando pixelate:', e);
    await sock.sendMessage(from, { text: '❌ Ocurrió un error al procesar la imagen.' }, { quoted: msg });
  }
}

