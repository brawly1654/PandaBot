import { downloadMediaMessage } from '@whiskeysockets/baileys';
import Jimp from 'jimp';

export const command = 'circle';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const isImage = quoted?.imageMessage;

  if (!isImage) {
    await sock.sendMessage(from, { text: '❌ Cita una imagen para recortarla en un círculo.' }, { quoted: msg });
    return;
  }

  try {
    const stream = await downloadMediaMessage(quoted.imageMessage, 'buffer', {}, { logger: console });
    const image = await Jimp.read(stream);

    const size = Math.min(image.bitmap.width, image.bitmap.height);
    image.circle();
    
    const processedBuffer = await image.getBufferAsync(Jimp.MIME_JPEG);
    await sock.sendMessage(from, { image: processedBuffer, caption: '✅ Imagen recortada en círculo.' }, { quoted: msg });

  } catch (e) {
    console.error('❌ Error en el comando circle:', e);
    await sock.sendMessage(from, { text: '❌ Ocurrió un error al procesar la imagen.' }, { quoted: msg });
  }
}

